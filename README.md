# Affiliate Parser

Parser that retrieve advertisers informations from Afiliate systems.

## Supported Affiliation groups

* [CJ Affiliate](https://cj.com/)
* [Zanox](http://www.zanox.com/us/)

## Get started

MongoDB and Redis are required to start the server.

**Note:** A `keys.json` file is required to start the server. This file contains all the
credentials for crawling the affiliate systems.
```
{
  "cj": {
    "username": [Email address],
    "password": [Password]
  }
}
```
