import { ChainId } from '@sushiswap/chain'
import { Auction } from 'features/context/Auction'
import { AuctionMarket } from 'features/context/AuctionMarket'
import {
  AuctionRepresentation,
  LiquidityPositionRepresentation,
  TokenRepresentation,
} from 'features/context/representations'
import { getAuctions, getExchangeTokens, getLiquidityPositions } from 'graph/graph-client'
import { useAuctionMakerBalance, useLiquidityPositionedPairs } from 'hooks/useAuctionMarketAssets'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useMemo } from 'react'
import useSWR, { SWRConfig } from 'swr'

import Layout from '../../components/Layout'

const fetcher = (params: any) =>
  fetch(params)
    .then((res) => res.json())
    .catch((e) => console.log(JSON.stringify(e)))

interface Props {
  fallback?: Record<string, any>
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  if (typeof query.chainId !== 'string') return { props: {} }
  return {
    props: {
      fallback: {
        [`/api/auctions/${query.chainId}`]: await getAuctions(query.chainId),
        [`/api/liquidity-positions/${query.chainId}`]: await getLiquidityPositions(query.chainId),
        [`/api/tokens/${query.chainId}`]: await getExchangeTokens(query.chainId),
      },
    },
  }
}

const _AuctionsPage: FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ fallback }) => {
  const router = useRouter()
  const chainId = Number(router.query.chainId)
  return (
    <SWRConfig value={{ fallback }}>
      <AuctionsPage chainId={chainId} />
    </SWRConfig>
  )
}
const AuctionsPage: FC<{ chainId: number }> = ({ chainId }) => {
  const { data: auctionRepresentations, isValidating: isValidatingAuctions } = useSWR<AuctionRepresentation[]>(
    `/auction-market/api/auctions/${chainId}`,
    fetcher,
  )
  const { data: lpRepresentations, isValidating: isValidatingLPs } = useSWR<LiquidityPositionRepresentation[]>(
    `/auction-market/api/liquidity-positions/${chainId}`,
    fetcher,
  )
  const { data: tokenRepresentations, isValidating: isValidatingTokens } = useSWR<TokenRepresentation[]>(
    `/auction-market/api/tokens/${chainId}`,
    fetcher,
  )
  const auctions = useMemo(
    () => auctionRepresentations?.map((auction) => new Auction({ auction })),
    [auctionRepresentations],
  )
  const [balances, loading] = useAuctionMakerBalance(ChainId.KOVAN, tokenRepresentations)
  const liquidityPositions = useLiquidityPositionedPairs(lpRepresentations)
  const auctionMarket = useMemo(
    () => new AuctionMarket({ auctions, liquidityPositions, balances }),
    [auctions, liquidityPositions, balances],
  )

  return (
    <Layout>
      <div className="px-2 pt-16">
        <h1>STATUSES</h1>
        <div>
          <div>LIVE: {auctionMarket.live.size}</div>
          <div>NOT STARTED: {Object.keys(auctionMarket.waiting).length}</div>
          <div>FINALIZED: {auctionMarket.finalised.size}</div>
        </div>
        <h1>Auctions</h1>
        {auctions?.length ? (
          auctions.map((auction) => (
            <div key={auction.id}>
              {auction.status} {``}
              {auction.amount.toString()} {` SUSHI `}
              {auction.leadingBid.amount.toString()} {auction.token.symbol} {``}
              {auction.remainingTime?.hours} {'H'} {auction.remainingTime?.minutes} {'M'}{' '}
              {auction.remainingTime?.seconds} {'S'}
              <Link href={`/users/${auction.leadingBid.user.id.toLowerCase()}/auctions?chainId=${chainId}`}>
                [User Auctions]
              </Link>
              <Link href={`/auction/${auction.id}?chainId=${chainId}`}>[Auction Page]</Link>
            </div>
          ))
        ) : (
          <div>
            <i>No Auctions found..</i>
          </div>
        )}
        <h1>AVAILABLE FOR START:</h1>
        <div>
          {!isValidatingAuctions || !isValidatingLPs || !isValidatingTokens
            ? Object.entries(auctionMarket.waiting).map(([address, token]) => (
                <div key={address}>
                  {token?.currency.symbol}, Balance: {token.toExact()}
                </div>
              ))
            : 'Loading..'}
        </div>
      </div>
    </Layout>
  )
}

export default _AuctionsPage