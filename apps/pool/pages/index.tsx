import { PlusIcon } from '@heroicons/react/solid'
import { Button, Link, OnsenIcon } from '@sushiswap/ui'
import { SUPPORTED_CHAIN_IDS } from 'config'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { FC } from 'react'
import { SWRConfig, unstable_serialize } from 'swr'

import { Layout, PoolsFiltersProvider, PoolsSection, SushiBarSection } from '../components'
import { getBundles, getPoolCount, getPools, GetPoolsQuery } from '../lib/api'

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600')
  const [pairs, bundles, poolCount] = await Promise.all([
    getPools(query as unknown as GetPoolsQuery),
    getBundles(),
    getPoolCount(),
  ])

  return {
    props: {
      fallback: {
        [unstable_serialize({
          url: '/pool/api/pools',
          args: {
            sorting: [
              {
                id: 'apr',
                desc: true,
              },
            ],
            selectedNetworks: SUPPORTED_CHAIN_IDS,
            pagination: {
              pageIndex: 0,
              pageSize: 20,
            },
            query: '',
            extraQuery: '',
          },
        })]: pairs,
        [`/pool/api/bundles`]: bundles,
        [`/pool/api/pools/count`]: poolCount,
      },
    },
  }
}

const Pools: FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ fallback }) => {
  return (
    <SWRConfig value={{ fallback }}>
      <_Pools />
    </SWRConfig>
  )
}

const _Pools = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-10 md:gap-16">
        <section className="flex flex-col gap-6 lg:flex-row">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-semibold text-slate-50">Sushi Yield</h2>
            <p className="text-slate-300">
              Onsen is back with a new contract, allowing for more yield opportunities and functionalities.{' '}
            </p>
          </div>
          <div className="flex justify-end flex-grow not-prose">
            <div className="flex flex-col gap-3 w-full lg:w-[200px]">
              <Link.Internal href="/add" passHref={true}>
                <Button as="a" fullWidth color="blue" startIcon={<PlusIcon width={16} height={16} />}>
                  New Position
                </Button>
              </Link.Internal>
              <Link.External href="https://rbieu62gj0f.typeform.com/to/KkrPkOFe">
                <Button fullWidth color="gray" startIcon={<OnsenIcon width={16} height={16} />}>
                  Join Onsen
                </Button>
              </Link.External>
            </div>
          </div>
        </section>
        <SushiBarSection />
        <PoolsFiltersProvider>
          <PoolsSection />
        </PoolsFiltersProvider>
      </div>
    </Layout>
  )
}

export default Pools
