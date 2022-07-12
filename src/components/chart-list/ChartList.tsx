import React, { useContext, useMemo } from 'react';
import { keyBy, groupBy, get } from 'lodash';
import { UncontrolledCollapse } from 'reactstrap';
import { ChartDocument, SongDocument } from 'tachi-common';
import { Context } from '../../api/Context';
import styles from './chart-list.module.scss';

export const Tiers = [
  '11F',
  '11E',
  '11D',
  '11C',
  '11B',
  '11A',
  '11A+',
  '11S',
  '11S+',
  'No Tier',
] as const;
export type TiersType = typeof Tiers[number];

const ChartList = (): JSX.Element => {
  const { pbs, charts, songs } = useContext(Context);

  const songsKeyedById = useMemo(
    () => keyBy(songs, (song) => song.id),
    [songs],
  );

  const pbsKeyedByChartId = useMemo(
    () => keyBy(pbs, (pb) => pb.chartID),
    [pbs],
  );

  const chartsGroupedByTier: Record<TiersType, ChartDocument[]> = useMemo(
    () =>
      groupBy(charts, (chart) =>
        get(chart, 'tierlistInfo.kt-NC.text', 'No Tier'),
      ) as unknown as Record<TiersType, ChartDocument[]>,
    [charts],
  );

  const getColourForLamp = (lamp: string): string => {
    switch (lamp) {
      case 'CLEAR':
        return '#4682b466';
      case 'EASY CLEAR':
        return '#32cd3266';
      case 'ASSIST CLEAR':
        return '#9932cc66';
      case 'FAILED':
        return '#AA555566';
      default:
        return '#fff';
    }
  };

  return chartsGroupedByTier && songsKeyedById && pbsKeyedByChartId ? (
    <div className={styles.chartList} id="top">
      <div className={styles.nav}>
        {Tiers.map((tier) => {
          const key = `key_${tier.replace('+', 'plus').replace(' ', '_')}`;
          return <a href={`#${key}`}>{tier}</a>;
        })}
        <a href="#top" className={styles.toTop}>
          TOP
        </a>
      </div>
      <hr />
      {Tiers.map((tier) => {
        const key = `key_${tier.replace('+', 'plus').replace(' ', '_')}`;
        return (
          <div key={key}>
            <h1 id={key}>{tier}</h1>
            <UncontrolledCollapse toggler={`#${key}`}>
              <ul>
                {chartsGroupedByTier?.[tier]?.map((chart) => (
                  <li
                    key={chart.chartID}
                    style={{
                      backgroundColor: getColourForLamp(
                        pbsKeyedByChartId[chart.chartID]?.scoreData.lamp,
                      ),
                    }}
                  >
                    <img
                      src={`https://cdn.kamaitachi.xyz/game-icons/iidx/${
                        songsKeyedById[chart.songID]?.data.displayVersion
                      }`}
                      alt={songsKeyedById[chart.songID]?.data.displayVersion}
                    />
                    {songsKeyedById[chart.songID]?.title || 'Unknown song'} -{' '}
                    {pbsKeyedByChartId[chart.chartID]?.scoreData.lamp ||
                      'NO PLAY'}
                  </li>
                ))}
              </ul>
            </UncontrolledCollapse>
          </div>
        );
      })}
      <hr />
    </div>
  ) : (
    <div>Loading</div>
  );
};

export default ChartList;
