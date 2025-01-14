import { formatPercent } from '@sushiswap/format'
import { classNames, Currency as UICurrency, Typography } from '@sushiswap/ui'
import React, { FC } from 'react'

import { Pair } from '../../../.graphclient'
import { incentiveRewardToToken } from '../../../lib/functions'
import { AddSectionMyPositionStaked } from './AddSectionMyPositionStaked'
import { AddSectionMyPositionUnstaked } from './AddSectionMyPositionUnstaked'

export const AddSectionMyPosition: FC<{ pair: Pair }> = ({ pair }) => {
  return (
    <div className="flex flex-col bg-white bg-opacity-[0.04] rounded-2xl">
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 items-center gap-2">
          <Typography variant="xs" weight={500} className="text-slate-300">
            Total APR:
          </Typography>
          <Typography variant="xs" weight={500} className="text-slate-300 text-right">
            {formatPercent(pair.apr)}
          </Typography>
          {pair.farm && (
            <>
              <Typography variant="xs" weight={500} className="text-slate-300">
                Fee APR:
              </Typography>
              <Typography variant="xs" weight={500} className="text-slate-300 text-right">
                {formatPercent(pair.feeApr)}
              </Typography>
              <Typography variant="xs" weight={500} className="text-slate-300">
                Reward APR:
              </Typography>
              <Typography variant="xs" weight={500} className="text-slate-300 text-right">
                {formatPercent(pair.incentiveApr)}
              </Typography>
              <Typography variant="xs" weight={500} className="text-slate-300">
                Farming Rewards:
              </Typography>
              <div className={classNames(pair.farm.incentives?.length === 2 ? '-mr-2' : '', 'flex justify-end ')}>
                <UICurrency.IconList iconWidth={16} iconHeight={16}>
                  {pair.farm.incentives?.map((incentive, index) => (
                    <UICurrency.Icon key={index} currency={incentiveRewardToToken(pair.chainId, incentive)} />
                  ))}
                </UICurrency.IconList>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="px-5">
        <hr className="h-px border-t border-slate-200/5" />
      </div>
      <div className="p-5 space-y-5">
        <AddSectionMyPositionUnstaked />
        {pair.farm && <AddSectionMyPositionStaked />}
      </div>
    </div>
  )
}
