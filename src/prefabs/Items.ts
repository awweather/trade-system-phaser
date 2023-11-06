import { v4 as uuidv4 } from "uuid";

export type ItemKey = keyof typeof itemPresets.items;

export const itemPresets = {
  items: {
    gold: {
      renderable: {
        sprite: {
          height: 45,
          width: 45,
          texture: "GoldPouch",
          frame: "GoldPouch.png",
          name: null,
          animations: [],
        },
        spriteKey: "gold",
        scale: 0,
      },
      descriptor: {
        description: "Pretty self explanatory.",
        name: "Gold",
      },
      summary: {
        summaryText: "Pretty self explanatory.",
      },
      valuable: {
        value: 1,
      },
      quantity: {
        value: 1,
      },
    },
    bluePendant: {
      descriptor: {
        description: "A necklace that would look nice in any occasion.",
        name: "Blue Pendant",
      },
      equippable: {
        levelRequirement: "0",
        slot: "neck",
      },
      id: 6,
      renderable: {
        spriteKey: "pendant",
      },
      requirements: {
        levelRequirement: "1",
      },
      valuable: {
        value: 2,
      },
    },
    blueWizardStaff: {
      descriptor: {
        description: "A staff embedded with a magical hue",
        name: "Wizard's Staff",
      },
      equippable: {
        levelRequirement: "1",
        slot: 0,
      },
      id: 11,
      implicitModifiers: {
        modifiersToAdd: ["elementalDamage"],
      },
      renderable: {
        spriteKey: "blue_wizard_staff",
      },
      requirements: {
        levelRequirement: "1",
        attributeRequirements: [
          {
            attribute: "intelligence",
            value: 10,
          },
        ],
      },
      valuable: {
        value: 6,
      },
      withSockets: {
        sockets: [
          {
            tier: "1",
          },
          {
            tier: "1",
          },
        ],
      },
    },
    dagger: {
      descriptor: {
        description: "A rusty old dagger, but better than nothing!",
        name: "Dagger",
      },
      equippable: {
        levelRequirement: "1",
        slot: "Hand",
      },
      itemId: {
        itemBase: "dagger",
      },
      implicitModifiers: {
        modifiers: [
          {
            minValue: 8,
            maxValue: 10,
            description: "8-10",
            templateId: "Physical Damage",
            groupDescription: "Physical Damage",
            groupId: "physicalDamage",
          },
        ],
      },
      renderable: {
        sprite: {
          height: 45,
          width: 45,
          texture: "Dagger",
          frame: "Dagger.png",
          name: null,
          animations: [],
        },
        spriteKey: "dagger",
        scale: 0,
      },
      requirements: {
        levelRequirement: "1",
        attributeRequirements: [
          {
            attribute: "strength",
            value: 10,
          },
        ],
      },
      summary: {},
      valuable: {
        value: 6,
      },
      withSockets: {
        sockets: [
          {
            tier: "1",
          },
          {
            tier: "1",
          },
        ],
      },
    },
    multiStrike: {
      descriptor: {
        description: "An insignia containing MultiStrike",
        name: "MultiStrike",
      },
      id: 3,
      renderable: {
        spriteKey: "sword_plunge_insignia",
      },
      skillable: {
        skillId: "MultiStrike",
        spriteKey: "multistrike",
      },
      socketable: {
        levelRequirement: "1",
        tier: "1",
      },
      requirements: {
        levelRequirement: "1",
      },
      valuable: {
        value: 4,
      },
    },
    potionOfHealth: {
      consumable: {
        statModifiers: {
          statModifier: {
            target: "Health",
            type: "Flat",
            value: "10",
          },
        },
        uses: "3",
      },
      descriptor: {
        description: "A small health potion.",
        name: "Potion of Health",
      },
      id: 7,
      renderable: {
        spriteKey: "health_potion",
      },
      requirements: {
        levelRequirement: "1",
      },
      valuable: {
        value: 2,
      },
    },
    silverRing: {
      descriptor: {
        description: "An imperfect yet pretty ring made out of silver.",
        name: "Silver Ring",
      },
      equippable: {
        levelRequirement: "0",
        slot: "Ring",
      },
      id: 5,
      renderable: {
        spriteKey: "silver_ring",
      },
      requirements: {
        levelRequirement: "1",
      },
      valuable: {
        value: 3,
      },
    },
    swordPlunge: {
      descriptor: {
        description: "An insignia containing Sword Plunge",
        name: "Sword Plunge",
      },
      id: 2,
      renderable: {
        spriteKey: "sword_plunge_insignia",
      },
      skillable: {
        skillId: "SwordPlunge",
        spriteKey: "sword_plunge_insignia",
      },
      requirements: {
        levelRequirement: "1",
      },
      socketable: {
        levelRequirement: "1",
        tier: "1",
      },
      valuable: {
        value: 4,
      },
    },
    mapTemplate: {
      descriptor: {
        description: "A map that will teleport you to a new area.",
        name: "Map",
      },
      id: 7,
      mapTemplate: {
        modifiers: ["test"],
      },
      consumable: {
        uses: 1,
      },
      renderable: {
        spriteKey: "map_1",
      },
      requirements: {
        levelRequirement: "1",
      },
      zone: {
        value: "Cave",
      },
      valuable: {
        value: 5,
      },
    },
    woodenShield: {
      descriptor: {
        description: "A small shield that provides some protection.",
        name: "Wooden Shield",
      },
      equippable: {
        levelRequirement: "1",
        slot: "Hand2",
      },
      id: 4,
      physicalResistance: {
        resistance: "2",
      },
      renderable: {
        spriteKey: "wooden_shield",
      },
      requirements: {
        levelRequirement: "1",
      },
      valuable: {
        value: 5,
      },
      withSockets: {
        sockets: {
          socket: [
            {
              tier: "1",
            },
          ],
        },
      },
    },
    firstInsignia: {
      descriptor: {
        name: "Splitting Insignia of Health",
        description: "A small crest that embues you with some added power",
      },
      id: 12,
      questItem: {
        taskId: 0,
        questId: "firstMission",
        questItemId: "firstInsignia",
      },
      equippable: {
        isEquipped: false,
      },
      insignia: {},
      requirements: {
        levelRequirement: "1",
      },
      renderable: {
        sprite: {
          texture: "SwordPlungeInsignia",
          frame: "SwordPlungeInsignia.png",
          height: 35,
          width: 35,
        },
        spriteKey: "sword_plunge_insignia",
      },
    },
    splittingInsignia: {
      descriptor: {
        name: "Splitting Insignia of Health",
        description: "A small crest that embues you with some added power",
      },
      id: 12,
      questItem: {
        taskId: 0,
        questId: "firstMission",
        questItemId: "firstInsignia",
      },
      insignia: {},
      requirements: {
        levelRequirement: "1",
      },
      itemPrefixes: {
        prefixes: {
          forkProjectiles: {
            description: "100% chance for projectiles to fork into 2",
            value: 1,
          },
        },
      },
      itemSuffixes: {
        suffixes: {
          increasedHealth: {
            description: "+10 health",
            value: 10,
          },
        },
      },
      renderable: {
        sprite: {
          texture: "SwordPlungeInsignia",
          frame: "SwordPlungeInsignia.png",
          height: 35,
          width: 35,
        },
        spriteKey: "sword_plunge_insignia",
      },
    },
  },
};

export const getGold = (amount: number) => {
  const id = uuidv4();
  return {
    components: {
      renderable: {
        sprite: {
          height: 45,
          width: 45,
          texture: "GoldPouch",
          frame: "GoldPouch.png",
          name: null,
          animations: [],
        },
        spriteKey: "gold",
        scale: 0,
      },
      descriptor: {
        description: "Pretty self explanatory.",
        name: "Gold",
      },
      itemId: {
        value: id,
        itemBase: "gold",
      },
      summary: {
        summaryText: "Pretty self explanatory.",
      },
      gold: {},
      valuable: {
        value: 1,
      },
      quantity: {
        value: amount,
      },
    },
    entityID: id,
  };
};
