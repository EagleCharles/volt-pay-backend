# Voltpay Backend

Voltpay's backend server is a NestJS application that facilitates interaction with the Algorand blockchain to process payments, handle transactions, and interface with third-party APIs. It works in conjunction with the frontend layer to provide a seamless experience for users.

## Technical Overview

The Voltpay backend processes bill payments, airtime purchases, and data transactions initiated from the frontend and recorded by the Voltpay smart contract. It achieves this by:

1. Querying the Algorand blockchain for transactions executed by the Voltpay smart contract.
2. Extracting relevant customer information from these transactions.
3. Completing the requested bill payments by interacting with third-party bill payment and VTU (Virtual Top-Up) service APIs.

This backend integration bridges the blockchain network with real-world services, enabling Voltpay to provide seamless and reliable utility payment solutions.

## Prerequisites

- **Node.js** (version 18+)
- **MongoDB** database (set up locally or in the cloud)

## Environment Variables

To configure the backend, create a `.env` file in the root directory of the project and add the following variables:

```plaintext
PORT=4040

MONGODB_URI=
MONGODB_DATABASE=

ALGOD_TOKEN=''
ALGOD_SERVER='https://testnet-api.algonode.cloud'
ALGOD_PORT=''

INDEXER_TOKEN=''
INDEXER_SERVER='https://testnet-idx.algonode.cloud'
INDEXER_PORT=''
```

Ensure that your MongoDB and Algorand credentials are configured correctly.

## Oracle Module

In `libs/modules/oracle`, the backend includes an **Oracle module** that queries the Algorand blockchain for transactions initiated by the Voltpay smart contract. This module runs a cron job every 10 seconds to check for and log relevant transactions, enabling real-time interaction and updates for Voltpay users.

## Getting Started

Follow these steps to set up and run the backend server:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/EagleCharles/volt-pay-backend
   cd volt-pay-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   In the project root, create a `.env` file and set the environment variables as specified above.

4. **Start the Application**
   ```bash
   npm run start:dev
   ```

   The server should now be running on `http://localhost:4040`.

### Testing the Application

- **Ensure MongoDB is running** and accessible.
- **Confirm Algorand network connectivity** by checking the Algorand API configuration in your `.env` file.
- **Run the frontend app** alongside this backend to fully test the Voltpay experience.

## Additional Resources

For more details on the frontend and smart contract layers, refer to:
- [Voltpay Frontend](https://github.com/charleswayne18/volt-pay-algorand-hackathon)
- [Voltpay Smart Contract](https://github.com/charleswayne18/volt-pay-smart-contract)

---

With these instructions, you should be able to configure and run the Voltpay backend server to process blockchain transactions, query the Algorand network, and support the overall Voltpay app functionality.
