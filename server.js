const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Nœuds RPC publics
const RPC_NODES = {
    Ethereum: "https://cloudflare-eth.com",
    BNB: "https://bsc-dataseed1.binance.org",
    Tron: "https://api.trongrid.io",
};

// Vérifier les paiements via RPC
async function checkPayment(walletAddress, crypto, network) {
    const nodeUrl = RPC_NODES[network];
    if (!nodeUrl) return false;

    try {
        const response = await axios.post(nodeUrl, {
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [walletAddress, "latest"],
            id: 1,
        });

        const balance = parseInt(response.data.result, 16) / 1e18;
        return balance >= 2; // Vérifie si l'utilisateur a au moins 2 USD en crypto
    } catch (error) {
        console.error("Erreur RPC:", error);
        return false;
    }
}

// Vérification du paiement sans base de données
app.post("/check-payment", async (req, res) => {
    const { walletAddress, crypto, network } = req.body;

    if (await checkPayment(walletAddress, crypto, network)) {
        return res.json({ success: true, message: "Paiement confirmé !" });
    }
    res.json({ success: false, message: "Paiement non trouvé." });
});

app.get("/", (req, res) => {
    res.redirect("https://angnor89.github.io/Downvid-pro/");
});
// Démarrer le serveur
app.listen(3000, () => console.log("Serveur en ligne sur http://localhost:3000"));
