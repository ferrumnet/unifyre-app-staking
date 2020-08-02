# Developer guide

## How to test locally

1. Set up the wallet dev with test DB
2. Create a pooldrop to two people
3. Claim for one person
4. Open database and the state of the link, so that it can be saved back after each test
5. Start ganache
6. Deploy pooldrop + Token to ganache
7. Add new token (DEV_TOK) to Uni. This will be a brand new token ID
8. Run nodewatcher with ganache and local
9. Run addressman with ganache and local
10. Sign and send, make sure:
- Gas limit is correct
- Can overrite gasLimit to fail the tx
- Timeout the tx


## How to test on prod

1. ssh into the test server. There is a docker compose of a test host + ganache + node watcher + address manager
2. point your web3 api to the test backend ganache
