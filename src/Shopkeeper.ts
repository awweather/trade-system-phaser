import { v4 as uuidv4 } from "uuid";
import { RawEntity } from "./ecs/InitializeEntity.ts";
export default function getShopkeeper(): RawEntity {
  const id = uuidv4();
  return {
    components: {
      descriptor: {
        name: "Goar",
      },
      shopkeeper: {
        baseItemIds: ["dagger"],
      },
      currency: {
        gold: 832,
      },
      inventory: {
        itemsToAdd: [],
        slots: [
          {
            slotIndex: 0,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 1,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 2,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 3,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 4,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 5,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 6,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 7,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 8,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 9,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 10,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 11,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 12,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 13,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 14,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 15,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 16,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 17,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 18,
            item: "00000000-0000-0000-0000-000000000000",
          },
          {
            slotIndex: 19,
            item: "00000000-0000-0000-0000-000000000000",
          },
        ],
        items: [],
        coins: 0,
      },
      playerId: {
        value: id,
      },
    },
    entityID: id,
  };
}
