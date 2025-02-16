console.log('Hello World!');

const translations = {
    en: {
        title: "Downvid Pro",
        description: "Paste the video link and download in high quality",
        placeholder: "Paste the link here...",
        downloadVideo: "Download Video",
        downloadAudio: "Download Audio",
        statusReady: "Ready to download",
        limitReached: "Limit reached! Please subscribe."
    },
    fr: {
        title: "Downvid Pro",
        description: "Collez le lien de la vidéo et téléchargez en haute qualité",
        placeholder: "Collez le lien ici...",
        downloadVideo: "Télécharger Vidéo",
        downloadAudio: "Télécharger Audio",
        statusReady: "Prêt à télécharger",
        limitReached: "Limite atteinte ! Veuillez vous abonner."
    },
    ru: {
        title: "Downvid Pro",
        description: "Вставьте ссылку на видео и загрузите в высоком качестве",
        placeholder: "Вставьте ссылку здесь...",
        downloadVideo: "Скачать видео",
        downloadAudio: "Скачать аудио",
        statusReady: "Готово к загрузке",
        limitReached: "Достигнут лимит! Пожалуйста, подпишитесь."
    }
};

function changeLanguage() {
    let lang = document.getElementById("language").value;
    document.querySelector("h1").innerText = translations[lang].title;
    document.querySelector("p").innerText = translations[lang].description;
    document.getElementById("videoUrl").placeholder = translations[lang].placeholder;
    document.querySelector(".options button:first-child").innerText = translations[lang].downloadVideo;
    document.querySelector(".options button:last-child").innerText = translations[lang].downloadAudio;
}
let downloadCount = localStorage.getItem("downloadCount") || 0;

async function download(type) {
    if (downloadCount >= 10) {
        alert(translations[document.getElementById("language").value].limitReached);
        showPaymentButton();
        return;
    }

    const videoUrl = document.getElementById("videoUrl").value;
    if (!videoUrl) return;

    document.getElementById("status").innerText = "Téléchargement en cours...";

    const response = await fetch("http://localhost:3000/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl, type })
    });

    const data = await response.json();
    if (data.error) {
        document.getElementById("status").innerText = "Erreur: " + data.error;
    } else {
        downloadCount++;
        localStorage.setItem("downloadCount", downloadCount);
        document.getElementById("status").innerText = "Téléchargement terminé!";
    }
}


async function download(type) {
    const videoUrl = document.getElementById("videoUrl").value;
    const status = document.getElementById("status");

    if (!videoUrl) {
        status.innerText = "Veuillez entrer un lien valide.";
        return;
    }

    status.innerText = "Téléchargement en cours...";

    try {
        const response = await fetch("http://localhost:3000/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: videoUrl, type })
        });

        const data = await response.json();

        if (data.error) {
            status.innerText = "Erreur: " + data.error;
        } else {
            status.innerText = "Téléchargement terminé!";
        }
    } catch (error) {
        status.innerText = "Erreur: Impossible de contacter le serveur.";
    }
}

function showPaymentButton() {
    document.getElementById("payment-section").style.display = "block";
}

function updateNetworkOptions() {
    let crypto = document.getElementById("crypto").value;
    let networkSection = document.getElementById("network-section");

    // Afficher le choix du réseau uniquement pour USDT
    if (crypto === "USDT") {
        networkSection.style.display = "block";
    } else {
        networkSection.style.display = "none";
    }
}

function payWithCrypto() {
    let crypto = document.getElementById("crypto").value;
    let network = document.getElementById("network").value;
    let walletAddress = getWalletAddress(crypto, network);
    let amount = 2; // Montant en dollars US

    if (!walletAddress) {
        alert("Adresse de paiement non configurée.");
        return;
    }

    const cryptoURL = `https://link.trustwallet.com/send?asset=${crypto}&to=${walletAddress}&amount=${amount}`;
    window.location.href = cryptoURL;

    // Simuler le paiement réussi après validation
    setTimeout(() => {
        alert("Paiement confirmé !");
        localStorage.setItem("downloadCount", 0); // Réinitialiser le compteur
        document.getElementById("payment-section").style.display = "none";
    }, 5000);
}

// Fonction pour récupérer l'adresse en fonction de la crypto et du réseau
function getWalletAddress(crypto, network) {
    const walletAddresses = {
        BTC: "bc1q5ldep0x5yqe527x2dkmwv0f5ctfk53m0wlvtf7",
        ETH: "0x6737dE7380381493eEa3b0aF64420b96fd4d575b",
        BNB: "0x6737dE7380381493eEa3b0aF64420b96fd4d575b",
        SOL: "G6yG3cSJ7jg56763NRYKvdehx5848Q3WANr3sHxWUz7s",
        TRX: "TNjXMtwG9zSnXp7XXXrrWv7YtU4XBJp41V",
        USDT: {
            TRC20: "TNjXMtwG9zSnXp7XXXrrWv7YtU4XBJp41V",
            ERC20: "0x6737dE7380381493eEa3b0aF64420b96fd4d575b",
            BEP20: "0x6737dE7380381493eEa3b0aF64420b96fd4d575b"
        }
    };

    return crypto === "USDT" ? walletAddresses.USDT[network] : walletAddresses[crypto];
}

function showPaymentInfo() {
    let crypto = document.getElementById("crypto").value;
    let network = document.getElementById("network").value;
    let walletAddress = getWalletAddress(crypto, network);

    document.getElementById("crypto-name").innerText = `${crypto} (${network})`;
    document.getElementById("wallet-address").value = walletAddress;
    
    // Générer un QR Code (utilise une API comme QuickChart)
    document.getElementById("qr-code").src = `https://quickchart.io/qr?text=${walletAddress}&size=150`;
}

function copyAddress() {
    let addressField = document.getElementById("wallet-address");
    addressField.select();
    document.execCommand("copy");
    alert("Adresse copiée !");
}

async function checkPayment() {
    let crypto = document.getElementById("crypto").value;
    let network = document.getElementById("network").value;
    let walletAddress = getWalletAddress(crypto, network);

    const explorerURLs = {
        BTC: `https://api.blockcypher.com/v1/btc/main/addrs/${walletAddress}/full`,
        ETH: `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&apikey=YourApiKey`,
        BNB: `https://api.bscscan.com/api?module=account&action=txlist&address=${walletAddress}&apikey=YourApiKey`,
        SOL: `https://api.solscan.io/account/transactions?account=${walletAddress}`,
        TRX: `https://api.trongrid.io/v1/accounts/${walletAddress}/transactions`,
        USDT: {
            TRC20: `https://api.trongrid.io/v1/accounts/${walletAddress}/transactions`,
            ERC20: `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&apikey=YourApiKey`,
            TON: `https://tonapi.io/v1/blockchain/transactions/${walletAddress}`,
            BEP20: `https://api.bscscan.com/api?module=account&action=txlist&address=${walletAddress}&apikey=YourApiKey`
        }
    };

    let apiURL = crypto === "USDT" ? explorerURLs.USDT[network] : explorerURLs[crypto];

    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        const transactions = data.transactions || data.result;

        for (let tx of transactions) {
            if (tx.to === walletAddress && tx.value >= 2) { 
                alert("Paiement confirmé ! Redirection...");
                localStorage.setItem("downloadCount", 0); // Réinitialiser le compteur
                window.location.href = "index.html"; 
                return;
            }
        }
        alert("Paiement non détecté. Veuillez réessayer.");
    } catch (error) {
        alert("Erreur lors de la vérification du paiement.");
        console.error(error);
    }
}


const BACKEND_URL = "https://angnor89.github.io/Downvid-pro/"; // Ou l'URL Ngrok

async function downloadVideo(link) {
    const response = await fetch(`${BACKEND_URL}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link })
    });
    const data = await response.json();
    console.log(data);
}

