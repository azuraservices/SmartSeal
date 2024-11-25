// contracts.ts

export interface ContractData {
    name: string; // Un nome descrittivo per il contratto
    address: string;
    abi: any[];
  }
  
  // Definisci i tuoi contratti
  export const contracts: ContractData[] = [
    {
      name: 'Contratto 1',
      address: '0xEAA479BEF2f24cEFC816735221EFc54a25101835',
      abi: [
        {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: 'uint256',
                name: 'objectId',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'string',
                name: 'ownerName',
                type: 'string',
              },
              {
                indexed: false,
                internalType: 'string',
                name: 'title',
                type: 'string',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
              },
            ],
            name: 'ObjectRegistered',
            type: 'event',
          },
          {
            inputs: [
              {
                internalType: 'string',
                name: '_ownerName',
                type: 'string',
              },
              {
                internalType: 'string',
                name: '_title',
                type: 'string',
              },
              {
                internalType: 'string',
                name: '_content',
                type: 'string',
              },
            ],
            name: 'registerObject',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'uint256',
                name: '_objectId',
                type: 'uint256',
              },
            ],
            name: 'signObject',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'uint256',
                name: '_objectId',
                type: 'uint256',
              },
            ],
            name: 'getObject',
            outputs: [
              {
                internalType: 'string',
                name: 'ownerName',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'title',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'content',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'isSigned',
                type: 'bool',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'objectCount',
            outputs: [
              {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
              },
            ],
            name: 'objects',
            outputs: [
              {
                internalType: 'string',
                name: 'ownerName',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'title',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'content',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'isSigned',
                type: 'bool',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        // ... ABI del Contratto 1
      ],
    },
    {
      name: 'Contratto 2',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      abi: [
        // ... ABI del Contratto 2
      ],
    },
    // Puoi aggiungere altri contratti qui
  ];