'use client';

import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Eye, Home } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const contractAddress = '0xEAA479BEF2f24cEFC816735221EFc54a25101835';
const contractABI = [
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
  // ... (stesso ABI del codice originale)
];

const HomePage: React.FC = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [objectId, setObjectId] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [contractInfo, setContractInfo] = useState<{
    address: string;
    objectCount: number;
  } | null>(null);
  const [objectDetails, setObjectDetails] = useState<{
    ownerName: string;
    title: string;
    content: string;
    ownerAddress: string;
    timestamp: string;
    isSigned: boolean;
  } | null>(null);

  useEffect(() => {
    if (contract) {
      fetchContractInfo();
    }
  }, [contract]);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask non è installato!');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accountAddress = await signer.getAddress();
      setAccount(accountAddress);

      const contractInstance = new Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractInstance);
    } catch (error: any) {
      console.error('Errore durante la connessione al wallet:', error);
    }
  };

  const fetchContractInfo = async () => {
    if (!contract) return;

    try {
      const objectCount = await contract.objectCount();
      setContractInfo({
        address: contractAddress,
        objectCount: Number(objectCount),
      });
    } catch (error: any) {
      console.error(
        'Errore durante il recupero delle informazioni del contratto:',
        error
      );
    }
  };

  const createObject = async () => {
    if (!ownerName || !title || !content || !contract) {
      alert('Tutti i campi sono obbligatori e devi connettere il wallet!');
      return;
    }

    try {
      const tx = await contract.registerObject(ownerName, title, content);
      await tx.wait();
      setOwnerName('');
      setTitle('');
      setContent('');
    } catch (error: any) {
      console.error("Errore durante la creazione dell'oggetto:", error);
    }
  };

  const signObject = async () => {
    if (objectId === null || !contract) {
      alert("Devi inserire l'ID dell'oggetto e connettere il wallet!");
      return;
    }

    try {
      const tx = await contract.signObject(objectId);
      await tx.wait();
      viewObject(); // Refresh object details after signing
    } catch (error: any) {
      console.error("Errore durante la firma dell'oggetto:", error);
    }
  };

  const viewObject = async () => {
    if (objectId === null || !contract) {
      alert("Devi inserire l'ID dell'oggetto!");
      return;
    }

    try {
      const details = await contract.getObject(objectId);
      setObjectDetails({
        ownerName: details.ownerName,
        title: details.title,
        content: details.content,
        ownerAddress: details.ownerAddress,
        timestamp: new Date(Number(details.timestamp) * 1000).toLocaleString(),
        isSigned: details.isSigned,
      });
    } catch (error: any) {
      console.error("Errore durante la visualizzazione dell'oggetto:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestione Oggetti Web3</h1>
          <div className="flex items-center gap-4">
            {account && (
              <Badge variant="secondary" className="px-4 py-2">
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </Badge>
            )}
            <Button onClick={connectWallet}>
              {account ? 'Wallet Connesso' : 'Connetti Wallet'}
            </Button>
          </div>
        </header>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crea
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualizza
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Contratto</CardTitle>
                <CardDescription>
                  Dettagli del contratto smart e statistiche
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contractInfo ? (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <h3 className="font-semibold">Indirizzo Contratto:</h3>
                      <code className="bg-muted p-2 rounded-md">
                        {contractInfo.address}
                      </code>
                    </div>
                    <div>
                      <h3 className="font-semibold">Numero di Oggetti:</h3>
                      <p className="text-2xl font-bold">
                        {contractInfo.objectCount}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Non connesso</AlertTitle>
                    <AlertDescription>
                      Connetti il tuo wallet per visualizzare le informazioni
                      del contratto.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Registra un Nuovo Oggetto</CardTitle>
                <CardDescription>
                  Inserisci i dettagli del nuovo oggetto da registrare sulla
                  blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label>Nome Proprietario</label>
                    <Input
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Inserisci il nome del proprietario"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label>Titolo Oggetto</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Inserisci il titolo dell'oggetto"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label>Descrizione Oggetto</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Inserisci la descrizione dell'oggetto"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={createObject} className="w-full">
                  Crea Oggetto
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Visualizza un Oggetto</CardTitle>
                <CardDescription>
                  Cerca e visualizza i dettagli di un oggetto esistente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Inserisci ID Oggetto"
                    value={objectId !== null ? objectId : ''}
                    onChange={(e) => setObjectId(Number(e.target.value))}
                  />
                  <Button onClick={viewObject}>Cerca</Button>
                </div>

                {objectDetails && (
                  <Card className="mt-4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{objectDetails.title}</CardTitle>
                          <CardDescription>
                            ID Oggetto: {objectId}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            objectDetails.isSigned ? 'default' : 'secondary'
                          }
                        >
                          {objectDetails.isSigned ? 'Firmato' : 'Non Firmato'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px] rounded-md border p-4">
                        <p className="text-sm">{objectDetails.content}</p>
                      </ScrollArea>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold">Proprietario:</span>{' '}
                          {objectDetails.ownerName}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Indirizzo:</span>{' '}
                          {objectDetails.ownerAddress}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Data:</span>{' '}
                          {objectDetails.timestamp}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={signObject}
                        disabled={objectDetails.isSigned}
                        className="w-full"
                      >
                        {objectDetails.isSigned
                          ? 'Già Firmato'
                          : 'Firma Oggetto'}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomePage;
