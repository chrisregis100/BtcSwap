# Guide complet pour tester BtcSwap

Ce guide décrit comment déployer les contrats sur Starknet Sepolia, configurer l’application et tester les flux Deposit, Swap et Withdraw.

---

## 1. Prérequis

### Outils

- **Node.js** 18+ et **npm**
- **Scarb** (Cairo/Starknet) : [https://docs.swmansion.com/scarb/](https://docs.swmansion.com/scarb/)
- **starknet-foundry** (sncast) pour le déploiement : [https://foundry-rs.github.io/starknet-foundry/](https://foundry-rs.github.io/starknet-foundry/)

```bash
# Vérifier Scarb
scarb --version

# Installer starknet-foundry (optionnel, pour sncast)
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/install.sh | sh
```

### Wallet et réseau

- **Wallet Starknet** : ArgentX ou Braavos (extension navigateur).
- **Réseau** : Starknet **Sepolia** (testnet).
- **ETH Sepolia** : nécessaire pour les frais. Faucet par exemple :
  - [Starknet Faucet](https://faucet.goerli.starknet.io/) (vérifier si Sepolia est supporté)
  - [Starknet Sepolia Bridge](https://starknet.io/bridges-and-onramps/) ou faucet communautaire

Dans le wallet, basculer sur **Starknet Sepolia**.

---

## 2. Build des contrats

```bash
cd contracts
scarb build
```

En cas de succès, les artefacts sont dans `target/dev/` (fichiers `.contract_class.json` et éventuellement `.casm`).

---

## 3. Déploiement des contrats

L’ordre est important : **PriceOracle** → **ZKVerifier** → **PrivateSwapVault**. Le Vault a besoin des adresses de l’oracle, du verifier et des tokens.

### 3.1 Variables d’environnement pour le déploiement

À définir (ou à noter après chaque déploiement) :

- `STARKNET_RPC_URL` : RPC Sepolia, ex. `https://starknet-sepolia.public.blastapi.io`
- `STARKNET_ACCOUNT` : adresse du compte (wallet) déployeur
- `STARKNET_PRIVATE_KEY` : clé privée du compte (pour signer les tx)

### 3.2 Déployer PriceOracle

**Constructeur** : `(initial_fallback_price: u128, admin: ContractAddress)`

- `initial_fallback_price` : prix BTC/USD pour les tests, avec 8 décimales. Ex. `50_000_000_000_000` = 50 000 USD (50_000 * 10^8).
- `admin` : adresse du wallet qui pourra appeler `set_fallback_price` et `set_admin`.

Exemple avec **sncast** (adapter les chemins selon votre build) :

```bash
cd contracts

# Déployer PriceOracle
sncast deploy --contract-name PriceOracle \
  --constructor-calldata 50000000000000 0x<VOTRE_ADRESSE_ADMIN_EN_HEX> \
  --url $STARKNET_RPC_URL --account $STARKNET_ACCOUNT

# Noter l’adresse du contrat déployé (Oracle)
export ORACLE_ADDRESS=0x...
```

Sans sncast, utiliser le Starknet CLI ou un script (e.g. avec starknet.js) en déclarant la classe puis en déployant avec les mêmes calldata.

### 3.3 Déployer ZKVerifier

**Constructeur** : `(mock_accept: bool)`

- Pour les tests : `true` (le stub accepte toute preuve non vide).

```bash
sncast deploy --contract-name ZKVerifier \
  --constructor-calldata true \
  --url $STARKNET_RPC_URL --account $STARKNET_ACCOUNT

export VERIFIER_ADDRESS=0x...
```

### 3.4 Tokens wBTC et USDC sur Sepolia

Deux options :

**Option A – Contrats ERC20 existants sur Sepolia**  
Si vous avez les adresses de wBTC et USDC (ou équivalents test) sur Starknet Sepolia, les utiliser directement.

**Option B – Déployer des ERC20 de test**  
Déployer deux contrats ERC20 minimalistes (mint à soi-même) et utiliser leurs adresses comme `WBTC_ADDRESS` et `USDC_ADDRESS`. Le Vault appelle `transfer_from` et `transfer` ; les sélecteurs doivent correspondre à l’ABI ERC20 (transfer, transfer_from).

Noter :

```bash
export WBTC_ADDRESS=0x...
export USDC_ADDRESS=0x...
```

### 3.5 Déployer PrivateSwapVault

**Constructeur** :  
`(verifier: ContractAddress, oracle: ContractAddress, wbtc_token: ContractAddress, usdc_token: ContractAddress)`

```bash
sncast deploy --contract-name PrivateSwapVault \
  --constructor-calldata $VERIFIER_ADDRESS $ORACLE_ADDRESS $WBTC_ADDRESS $USDC_ADDRESS \
  --url $STARKNET_RPC_URL --account $STARKNET_ACCOUNT

export VAULT_ADDRESS=0x...
```

---

## 4. Configuration de l’application

Dans le dossier `app` :

```bash
cd app
cp .env.example .env.local
```

Éditer `.env.local` et renseigner les adresses déployées :

```env
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_VERIFIER_ADDRESS=0x...
NEXT_PUBLIC_WBTC_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://starknet-sepolia.public.blastapi.io
NEXT_PUBLIC_CHAIN_ID=SN_SEPOLIA
```

Redémarrer le serveur Next après modification des variables d’environnement.

---

## 5. Lancer l’application

```bash
cd app
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). S’assurer que le wallet est sur **Starknet Sepolia**.

---

## 6. Scénarios de test

### 6.1 Connexion du wallet

1. Cliquer sur **Connect Wallet**.
2. Sélectionner ArgentX ou Braavos et autoriser le site.
3. Vérifier que l’adresse s’affiche (tronquée) et le statut « connecté ».

### 6.2 Approvisionner le wallet en tokens de test

- Avoir des **wBTC** et **USDC** (ou vos ERC20 de test) sur Sepolia (mint ou faucet selon votre setup).
- Pour le Vault, il faut aussi que l’utilisateur ait **approuvé** le Vault sur chaque token (`approve(vault_address, amount)`).

### 6.3 Test : Deposit

1. Choisir **Deposit**, token (wBTC ou USDC) et montant.
2. **Avant** d’appeler Deposit dans l’UI :
   - Appeler sur le token : `approve(VAULT_ADDRESS, amount)` (amount en u256 : low, high si besoin).
3. Dans l’UI, lancer **Deposit** (l’app enverra `deposit(amount_low, amount_high, token_address)` au Vault).
4. Après la tx :
   - Le contrat émet un event `Deposit` avec `commitment` et `salt`.
   - Dans l’app, sauvegarder ces valeurs en **Credentials** (export/import) pour les utiliser au Swap et Withdraw.

Pour un test minimal sans intégration complète des events, vous pouvez temporairement enregistrer à la main un credential (commitment + salt) reçu d’un event et le stocker côté client.

### 6.4 Test : Credentials (export / import)

1. **Export** : après un deposit (ou après avoir ajouté un credential), cliquer **Export**. Copier le JSON et le sauvegarder.
2. **Import** : coller le JSON dans la zone prévue et cliquer **Import**. Vérifier que les credentials réapparaissent (ou que l’état de l’app reflète l’import).
3. **Clear** : tester la suppression locale (attention : perte d’accès si vous n’avez pas exporté).

### 6.5 Test : Swap (privé)

Le swap nécessite :

- Un **commitment** existant (entrée) issu d’un deposit.
- Un **nouveau commitment** (sortie) pour le solde après swap.
- Un **nullifier** pour « consommer » l’entrée (éviter double dépense).
- Une **preuve ZK** : en MVP, le verifier stub accepte une preuve factice tant que `proof_len > 0`, `commitment != 0`, `user_address != 0`.

Pour générer une preuve de test via l’API :

```bash
curl -X POST http://localhost:3000/api/proof \
  -H "Content-Type: application/json" \
  -d '{
    "commitment": "0x123...",
    "nullifier": "0x456...",
    "amount": "1000000",
    "userAddress": "0x<VOTRE_ADRESSE_FELT>"
  }'
```

Réponse attendue : `{ "proof": [ ... ] }` (tableau de 8 felts). Utiliser ce tableau comme paramètre `proof` de `swap_private`.

Dans l’UI, le bouton **Swap** peut être branché pour :  
1) appeler `/api/proof` avec commitment, nullifier, amount, userAddress ;  
2) construire les calldata `swap_private(proof, commitment_in, commitment_out, nullifier, amount_in, token_in, token_out)` ;  
3) envoyer la transaction au Vault.

Points à respecter on-chain :

- `commitment_in` doit être un commitment déjà enregistré (dépôt précédent).
- `nullifier` ne doit jamais avoir été utilisé.
- `token_in` et `token_out` différents (wBTC ↔ USDC).

### 6.6 Test : Withdraw

1. Avoir un commitment « dépensé » côté swap et un solde privé en USDC (ou wBTC) dans le Vault.
2. Générer une preuve (même API stub ou manuelle) avec le commitment à retirer, le nullifier et le montant.
3. Appeler `withdraw(proof, commitment, nullifier, amount_low, amount_high, token)`.
4. Vérifier que les tokens arrivent sur l’adresse du signataire.

---

## 7. Vérifications on-chain

- **Starknet Sepolia Explorer** (ex. [Starkscan Sepolia](https://sepolia.starkscan.co/)) :  
  Vérifier les transactions du Vault (deposit, swap_private, withdraw) et les events émis.
- **Prix** : appeler `get_btc_usd_price()` sur l’Oracle (lecture seule) pour confirmer le prix utilisé par le Vault.
- **Réserves** : appeler `get_reserves(token)` sur le Vault pour voir les réserves agrégées par token.

---

## 8. Dépannage

| Problème | Piste de résolution |
|----------|----------------------|
| « Set contract addresses in env » | Vérifier que toutes les variables `NEXT_PUBLIC_*_ADDRESS` sont remplies dans `.env.local` et redémarrer `npm run dev`. |
| Transaction rejetée (approve) | Vérifier que le token est bien celui configuré (WBTC/USDC) et que le montant est au bon format (u256). |
| « Unknown commitment » au swap | S’assurer que `commitment_in` correspond à un commitment enregistré lors d’un deposit (vérifier les events). |
| « Nullifier used » | Chaque nullifier ne peut servir qu’une fois ; utiliser un nouveau nullifier pour chaque opération. |
| « Invalid proof » | En MVP, le verifier est déployé avec `mock_accept: true`. Vérifier que la preuve envoyée a au moins 1 élément et que commitment et user_address sont non nuls. |
| Build Scarb échoue | `scarb build` dans `contracts/` ; vérifier la version de Scarb et les dépendances (starknet). |

---

## 9. Résumé des commandes utiles

```bash
# Contrats
cd contracts && scarb build

# Déploiement (exemple avec sncast)
export STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
# ... déployer Oracle, Verifier, tokens, Vault (voir sections 3.2–3.5)

# App
cd app && cp .env.example .env.local
# Éditer .env.local avec les adresses
npm install && npm run dev

# Preuve de test (depuis une autre console)
curl -X POST http://localhost:3000/api/proof \
  -H "Content-Type: application/json" \
  -d '{"commitment":"0x1","nullifier":"0x2","amount":"0","userAddress":"0x<VOTRE_ADRESSE>"}'
```

En suivant ce guide, vous pouvez tester le système de bout en bout sur Starknet Sepolia avec le verifier stub et l’oracle à prix fixe.
