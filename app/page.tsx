'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
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

import { contracts, ContractData } from './contracts';

interface ContractInfo {
  address: string;
  objectCount: number;
}

interface ObjectDetails {
  ownerName: string;
  title: string;
  content: string;
  ownerAddress: string;
  timestamp: string;
  isSigned: boolean;
}

const HomePage = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [objectId, setObjectId] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [objectDetails, setObjectDetails] = useState<ObjectDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [selectedContractData, setSelectedContractData] = useState<ContractData | null>(null);
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);

  // Configura le opzioni del provider per WalletConnect
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: 'd20498bf032647fda188ad14bfd7f0de', // Sostituisci con la tua API Key di Infura
        rpc: {
          1: 'https://mainnet.infura.io/v3/d20498bf032647fda188ad14bfd7f0de',
          137: 'https://rpc-amoy.polygon.technology', // Rete Polygon Mainnet
          // Aggiungi altre reti se necessario
        },
      },
    },
  };

  useEffect(() => {
    const web3ModalInstance = new Web3Modal({
      network: 'mainnet', // 'matic' per Polygon
      cacheProvider: false,
      providerOptions,
    });
    setWeb3Modal(web3ModalInstance);
  }, []);

  useEffect(() => {
    if (contract) {
      fetchContractInfo();
    }
  }, [contract]);

  const connectWallet = async () => {
    setErrorMessage(null);
    if (!selectedContractData) {
      setErrorMessage('Devi selezionare un contratto!');
      return;
    }

    try {
      const instance = await web3Modal?.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      setAccount(accountAddress);

      const contractInstance = new ethers.Contract(
        selectedContractData.address,
        selectedContractData.abi,
        signer
      );
      setContract(contractInstance);
    } catch (error: any) {
      console.error('Errore durante la connessione al wallet:', error.message);
      setErrorMessage('Errore durante la connessione al wallet.');
    }
  };

  const disconnectWallet = async () => {
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }
    setAccount(null);
    setContract(null);
    setContractInfo(null);
    setObjectDetails(null);
  };

  const fetchContractInfo = async () => {
    setErrorMessage(null);
    if (!contract) return;

    try {
      const objectCount = await contract.objectCount();
      const address = contract.address;

      setContractInfo({
        address: address,
        objectCount: Number(objectCount),
      });
    } catch (error: any) {
      console.error(
        'Errore durante il recupero delle informazioni del contratto:',
        error.message
      );
      setErrorMessage('Errore durante il recupero delle informazioni del contratto.');
    }
  };

  const createObject = async () => {
    setErrorMessage(null);
    if (!ownerName.trim() || !title.trim() || !content.trim()) {
      setErrorMessage('Tutti i campi sono obbligatori.');
      return;
    }
    if (!contract) {
      setErrorMessage('Devi connettere il wallet!');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Creazione dell\'oggetto in corso...');
      const tx = await contract.registerObject(ownerName, title, content);
      await tx.wait();
      setOwnerName('');
      setTitle('');
      setContent('');
      fetchContractInfo();
      setLoadingMessage('');
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setLoadingMessage('');
      console.error("Errore durante la creazione dell'oggetto:", error.message);
      setErrorMessage("Errore durante la creazione dell'oggetto.");
    }
  };

  const signObject = async () => {
    setErrorMessage(null);
    if (objectId === null) {
      setErrorMessage("Devi inserire l'ID dell'oggetto!");
      return;
    }
    if (!contract) {
      setErrorMessage("Devi connettere il wallet!");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Firma dell\'oggetto in corso...');
      const tx = await contract.signObject(objectId);
      await tx.wait();
      await viewObject();
      setLoadingMessage('');
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setLoadingMessage('');
      console.error("Errore durante la firma dell'oggetto:", error.message);
      setErrorMessage("Errore durante la firma dell'oggetto.");
    }
  };

  const viewObject = async () => {
    setErrorMessage(null);
    if (objectId === null) {
      setErrorMessage("Devi inserire l'ID dell'oggetto!");
      return;
    }
    if (!contract) {
      setErrorMessage("Devi connettere il wallet!");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Recupero dei dettagli dell\'oggetto in corso...');
      const details = await contract.getObject(objectId);

      setObjectDetails({
        ownerName: details.ownerName,
        title: details.title,
        content: details.content,
        ownerAddress: details.ownerAddress,
        timestamp: new Date(Number(details.timestamp) * 1000).toLocaleString(),
        isSigned: details.isSigned,
      });
      setIsLoading(false);
      setLoadingMessage('');
    } catch (error: any) {
      setIsLoading(false);
      setLoadingMessage('');
      console.error("Errore durante la visualizzazione dell'oggetto:", error.message);
      setErrorMessage("Errore durante la visualizzazione dell'oggetto.");
    }
  };

  const HeaderComponent = () => (
    <header className="flex flex-col sm:flex-row justify-between items-center mb-4">
      <h1 className="text-4xl font-black">SmartSeal</h1>
      <p className="mb-3 text-gray-600 sm:hidden">
        I tuoi contratti inviolabili
      </p>
      <div className="flex flex-wrap items-center gap-4 mt-1 sm:mt-0">
        <div>
          <label htmlFor="contractSelect" className="sr-only text-[12px]">Seleziona Contratto</label>
          <select
            id="contractSelect"
            value={selectedContractData ? selectedContractData.address : ''}
            onChange={(e) => {
              const selectedAddress = e.target.value;
              const contractData = contracts.find(
                (c) => c.address === selectedAddress
              );
              setSelectedContractData(contractData || null);
              setContract(null);
              setContractInfo(null);
              setObjectDetails(null);
            }}
            className="rounded-[1.6rem] p-1 text-[12px]"
          >
            <option value="" disabled>
              Seleziona
            </option>
            {contracts.map((contract) => (
              <option key={contract.address} value={contract.address}>
                {contract.name}
              </option>
            ))}
          </select>
        </div>
        {account && (
          <Badge variant="secondary" className="px-4 py-2">
            {`${account.slice(0, 6)}...${account.slice(-4)}`}
          </Badge>
        )}
        {account ? (
          <Button onClick={disconnectWallet} disabled={isLoading} className='text-[10px] mb-0 h-8'>
            Disconnetti
          </Button>
        ) : (
          <Button onClick={connectWallet} disabled={isLoading || !selectedContractData} className='text-[10px] h-8'>
            Connetti
          </Button>
        )}
      </div>
    </header>
  );

  const ContractInfoCard = () => (
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
              <code className="text-[10px] bg-muted p-2 rounded-md text-center">
                {contractInfo.address}
              </code>
            </div>
            <div className='rounded-md border p-4'>
              <ScrollArea className="h-[100px]">
                <p className="text-sm">Condizioni contratto</p>
              </ScrollArea>
            </div>
            <div>
            
            <div className="flex items-center space-x-2 justify-center">
              <h3 className="font-semibold">Numero di Oggetti:</h3>
              <code className="text-[14px] font-black bg-muted p-2 rounded-md pr-4 pl-4">
                {contractInfo.objectCount}
              </code>
            </div>
              
            </div>
          </div>
        ) : (
          <Alert variant="destructive">
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
  );

  const CreateObjectForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Registra Oggetto</CardTitle>
        <CardDescription>
          Inserisci i dettagli da registrare sulla
          blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="ownerName" className='font-semibold'>Nome Proprietario</label>
            <Input
              id="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Inserisci il nome del proprietario"
              className='rounded-[0.6rem]'
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="title" className='font-semibold'>Titolo Oggetto</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Inserisci il titolo dell'oggetto"
              className='rounded-[0.6rem]'
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="content" className='font-semibold'>Descrizione Oggetto</label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Inserisci la descrizione dell'oggetto"
              className="min-h-[100px] rounded-[0.6rem]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={createObject} className="w-full" disabled={isLoading}>
          {isLoading ? 'Creazione in corso...' : 'Crea Oggetto'}
        </Button>
      </CardFooter>
    </Card>
  );

  const ObjectDetailsCard = () => {
    if (!objectDetails) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className='uppercase font-black'>{objectDetails.title}</CardTitle>
              <CardDescription className='text-sm'>ID Oggetto: {objectId}</CardDescription>
            </div>
            <Badge variant={objectDetails.isSigned ? 'default' : 'secondary'}>
              {objectDetails.isSigned ? 'Firmato' : 'Non Firmato'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border p-4'>
            <ScrollArea className="h-[200px]">
              <p className="text-sm">{objectDetails.content}</p>
            </ScrollArea>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Proprietario:</span> <span className='font-black uppercase'>{objectDetails.ownerName}</span>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Indirizzo:</span> <span className='text-[10px]'>{objectDetails.ownerAddress}</span>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Data:</span> {objectDetails.timestamp}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={signObject}
            disabled={objectDetails.isSigned || isLoading}
            className="w-full"
          >
            {isLoading
              ? 'Firma in corso...'
              : objectDetails.isSigned
              ? 'Già Firmato'
              : 'Firma Oggetto'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const ViewObjectCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Visualizza un Oggetto</CardTitle>
        <CardDescription>
          Cerca e visualizza i dettagli in Blockchain
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
          <Button onClick={viewObject} disabled={isLoading}>
            {isLoading ? 'Caricamento...' : 'Cerca'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <div className="container mx-auto">
        <HeaderComponent />
        {errorMessage && (
          <Alert variant="destructive" className='mb-4'>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {loadingMessage && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Operazione in corso</AlertTitle>
            <AlertDescription>{loadingMessage}</AlertDescription>
          </Alert>
        )}
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-4"
        >
          <TabsList className="flex flex-wrap justify-between w-full">
            <TabsTrigger value="home" className="flex items-center gap-2 flex-1 justify-center">
              <Home className="w-4 h-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2 flex-1 justify-center">
              <Plus className="w-4 h-4" />
              Crea
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2 flex-1 justify-center">
              <Eye className="w-4 h-4" />
              Visualizza
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <ContractInfoCard />
          </TabsContent>

          <TabsContent value="create">
            <CreateObjectForm />
          </TabsContent>

          <TabsContent value="view">
            <ViewObjectCard />
            {objectDetails && <ObjectDetailsCard />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomePage;