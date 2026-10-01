# Anatomy of a slice — annotated example

Context `orders`, feature `place-order`. Every file below is the reference shape; adapt
names, keep structure.

## domain/order.ts

```ts
import { err, ok, type Result } from 'neverthrow';
import type { OrderError } from './order.errors.js';

export type OrderId = string & { readonly __brand: 'OrderId' };

export interface OrderLine {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
}

export interface Order {
  readonly id: OrderId;
  readonly customerId: string;
  readonly lines: readonly OrderLine[];
  readonly status: 'placed' | 'cancelled';
  readonly placedAt: Date;
}

// Factory enforces invariants and returns a Result instead of throwing.
export function placeOrder(input: {
  id: OrderId;
  customerId: string;
  lines: readonly OrderLine[];
  now: Date;
}): Result<Order, OrderError> {
  if (input.lines.length === 0) {
    return err({ type: 'OrderHasNoLines' });
  }
  if (input.lines.some((l) => l.quantity <= 0)) {
    return err({ type: 'InvalidQuantity' });
  }
  return ok({
    id: input.id,
    customerId: input.customerId,
    lines: input.lines,
    status: 'placed',
    placedAt: input.now,
  });
}

export const orderTotalCents = (order: Order): number =>
  order.lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
```

## domain/order.errors.ts

```ts
// Discriminated union: exhaustively switchable, serialisable, no class hierarchy.
export type OrderError =
  | { type: 'OrderHasNoLines' }
  | { type: 'InvalidQuantity' }
  | { type: 'OrderNotFound'; orderId: string }
  | { type: 'OrderAlreadyCancelled'; orderId: string };
```

## ports/order.repository.ts

```ts
import type { ResultAsync } from 'neverthrow';
import type { Order, OrderId } from '../domain/order.js';
import type { OrderError } from '../domain/order.errors.js';
import type { InfrastructureError } from '../../../shared/kernel/errors.js';

// Abstract class = TypeScript contract + Nest DI token. No Nest import needed.
export abstract class OrderRepository {
  abstract save(order: Order): ResultAsync<void, InfrastructureError>;
  abstract findById(id: OrderId): ResultAsync<Order, OrderError | InfrastructureError>;
}
```

## features/place-order/place-order.dto.ts

```ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PlaceOrderSchema = z.object({
  customerId: z.string().uuid(),
  lines: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        unitPriceCents: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

export class PlaceOrderDto extends createZodDto(PlaceOrderSchema) {}

export const PlaceOrderResponseSchema = z.object({ orderId: z.string() });
export class PlaceOrderResponseDto extends createZodDto(PlaceOrderResponseSchema) {}
```

## features/place-order/place-order.use-case.ts

```ts
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ResultAsync } from 'neverthrow';
import { placeOrder, type OrderId } from '../../domain/order.js';
import type { OrderError } from '../../domain/order.errors.js';
import { OrderRepository } from '../../ports/order.repository.js';
import type { InfrastructureError } from '../../../../shared/kernel/errors.js';
import type { PlaceOrderDto } from './place-order.dto.js';

export interface PlaceOrderOutput {
  orderId: string;
}

@Injectable()
export class PlaceOrderUseCase {
  constructor(private readonly orders: OrderRepository) {}

  execute(input: PlaceOrderDto): ResultAsync<PlaceOrderOutput, OrderError | InfrastructureError> {
    return placeOrder({
      id: randomUUID() as OrderId,
      customerId: input.customerId,
      lines: input.lines,
      now: new Date(),
    })
      .asyncAndThen((order) => this.orders.save(order).map(() => order))
      .map((order) => ({ orderId: order.id }));
  }
}
```

Note: the use case imports the DTO *type* from its own slice. That is fine — it's the
slice's own input contract. It never imports `@nestjs/common` HTTP things (`HttpException`,
`@Body`…), only `Injectable`.

## features/place-order/place-order.controller.ts

```ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { unwrapOrThrowHttp } from '../../../../shared/http/result-to-http.js';
import { orderHttpErrors } from '../../orders.http-errors.js';
import { PlaceOrderDto, PlaceOrderResponseDto } from './place-order.dto.js';
import { PlaceOrderUseCase } from './place-order.use-case.js';

@Controller('orders')
export class PlaceOrderController {
  constructor(private readonly placeOrder: PlaceOrderUseCase) {}

  @Post()
  @HttpCode(201)
  @ZodSerializerDto(PlaceOrderResponseDto)
  async handle(@Body() body: PlaceOrderDto): Promise<PlaceOrderResponseDto> {
    return unwrapOrThrowHttp(await this.placeOrder.execute(body), orderHttpErrors);
  }
}
```

One controller per slice, one handler method named `handle`. Several slices share the
same route prefix (`'orders'`) — that is expected: the URL is a public concern, the folder
is an internal one.

## orders.module.ts

```ts
import { Module } from '@nestjs/common';
import { OrderRepository } from './ports/order.repository.js';
import { KyselyOrderRepository } from './infrastructure/kysely-order.repository.js';
import { PlaceOrderController } from './features/place-order/place-order.controller.js';
import { PlaceOrderUseCase } from './features/place-order/place-order.use-case.js';
import { CancelOrderController } from './features/cancel-order/cancel-order.controller.js';
import { CancelOrderUseCase } from './features/cancel-order/cancel-order.use-case.js';

@Module({
  controllers: [PlaceOrderController, CancelOrderController],
  providers: [
    { provide: OrderRepository, useClass: KyselyOrderRepository },
    PlaceOrderUseCase,
    CancelOrderUseCase,
  ],
})
export class OrdersModule {}
```

Keep the list grouped: ports first, then one line pair per slice, in folder order.
