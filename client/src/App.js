import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x539" }],
          });
        } catch (switchError) {
          console.warn("Network switch error:", switchError);
        }

        window.ethereum.on("chainChanged", () => window.location.reload());
        window.ethereum.on("accountsChanged", () => window.location.reload());

        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        console.log("🟢 Connected account:", address);

        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        const contract = new ethers.Contract(
          contractAddress,
          Upload.abi,
          signer
        );

        const balance = await provider.getBalance(address);
        console.log("💰 Balance:", ethers.utils.formatEther(balance), "ETH");

        setAccount(address);
        setContract(contract);
        setProvider(provider);
      } else {
        console.error("Metamask not installed");
      }
    };

    loadProvider();
  }, []);

  return (
    <>
      {!modalOpen && (
        <button className="share" onClick={() => setModalOpen(true)}>
          Share
        </button>
      )}
      {modalOpen && <Modal setModalOpen={setModalOpen} contract={contract} />}

      <div className="App">
        <h1 style={{ color: "white" }}>Cloud Drop</h1>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>

        <p style={{ color: "white" }}>
          Account : {account ? account : "Not connected"}
        </p>

        <FileUpload account={account} provider={provider} contract={contract} />
        <Display contract={contract} account={account} />
      </div>
    </>
  );
}

export default App;
