import { get, groupBy, keyBy } from 'lodash';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ChartDocument, SongDocument } from 'tachi-common';
import { Context } from '../../api/Context';
import { Tiers, TiersType } from '../chart-list/ChartList';
import styles from './chart-recommend.module.scss';

const ChartRecommend = (): JSX.Element => {
  const { charts, pbs, songs } = useContext(Context);
  const [userLevel, setUserLevel] = useState(0);
  const [songToPlay, setSongToPlay] = useState<SongDocument<'iidx'>>();

  const songsKeyedById = useMemo(
    () => keyBy(songs, (song) => song.id),
    [songs],
  );

  const pbsKeyedByChartId = useMemo(
    () => keyBy(pbs, (pb) => pb.chartID),
    [pbs],
  );

  const chartsWithoutPbClear = useMemo(
    () =>
      charts.filter(
        (chart) =>
          !Object.keys(pbsKeyedByChartId) ||
          pbsKeyedByChartId[chart.chartID]?.scoreData.lamp !== 'CLEAR',
      ),
    [charts, pbsKeyedByChartId],
  );

  const chartsWithoutPbsGroupedByTier: Record<TiersType, ChartDocument[]> =
    useMemo(
      () =>
        groupBy(chartsWithoutPbClear, (chart) =>
          get(chart, 'tierlistInfo.kt-NC.text', 'No Tier'),
        ) as unknown as Record<TiersType, ChartDocument[]>,
      [chartsWithoutPbClear],
    );

  const tierNoClearCount = useMemo(
    () =>
      Tiers.filter((tier) => tier !== 'No Tier').reduce(
        (newObj, val) => ({
          ...newObj,
          [val]: chartsWithoutPbsGroupedByTier[val]?.length || 0,
        }),
        {},
      ),
    [chartsWithoutPbsGroupedByTier],
  );

  const pickSong = () => {
    const chartsToPlay = chartsWithoutPbsGroupedByTier[Tiers[userLevel]] || [];
    const randomChart =
      chartsToPlay[Math.floor(Math.random() * chartsToPlay.length)];
    setSongToPlay(songsKeyedById[randomChart.songID]);
  };

  useEffect(() => {
    Tiers.forEach((tier, i) => {
      if (tierNoClearCount[tier] === 0) {
        setUserLevel((level) => level + 1);
      }
    });
  }, [chartsWithoutPbsGroupedByTier, tierNoClearCount]);

  return (
    <div className={styles.chartRecommend}>
      <button type="button" onClick={pickSong} className={styles.pickSong}>
        Pick {Tiers[userLevel]} ({tierNoClearCount[Tiers[userLevel]]})
      </button>
      {songToPlay && (
        <div className={styles.songData}>
          <p>
            {songToPlay.title}
            <br />
            {songToPlay.artist}
          </p>
          <img
            src={`https://cdn.kamaitachi.xyz/game-icons/iidx/${songToPlay.data.displayVersion}`}
            alt={songToPlay.data.displayVersion}
          />
        </div>
      )}
      <div className={styles.diff}>
        <button
          type="button"
          onClick={() => setUserLevel((level) => level - 1)}
        >
          Easier
        </button>
        <button
          type="button"
          onClick={() => setUserLevel((level) => level + 1)}
        >
          Harder
        </button>
      </div>
    </div>
  );
};

export default ChartRecommend;
