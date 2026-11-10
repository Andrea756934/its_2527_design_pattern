import { Module } from "@nestjs/common";
import { SeatInventory } from "./seat-inventory";

@Module({
    providers: [{ provide: SeatInventory, useFactory: () => SeatInventory.getInstance() }],
    exports: [SeatInventory]
})
export class InventoryModule { }