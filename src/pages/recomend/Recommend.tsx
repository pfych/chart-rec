import { get, groupBy, keyBy } from 'lodash';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartDocument,
  FolderDocument,
  PBScoreDocument,
  SongDocument,
} from 'tachi-common';
import moment from 'moment';
import { AuthContext } from '../../api/AuthContext';
import { request } from '../../api/Request';
import Button from '../../components/button-with-loader/Button';
import Loading from '../../components/loading/Loading';
import Page from '../../components/page/Page';
import styles from './recomend.module.scss';

interface scoreObject {
  charts: ChartDocument<'iidx:SP'>[];
  pbs: PBScoreDocument<'iidx:SP'>[];
  songs: SongDocument<'iidx'>[];
  folder: FolderDocument;
}

interface scoreObjects {
  SP11: scoreObject;
  SP12: scoreObject;
}

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
  '12F',
  '12E',
  '12D',
  '12C',
  '12B',
  '12A',
  '12S',
  '12S+',
  'No Tier',
] as const;
export type TiersType = typeof Tiers[number];

const MonthInSeconds = 2629800;

const Recommend = (): JSX.Element => {
  const navigate = useNavigate();
  const [isOAuth, setIsOAuth] = useState(undefined);
  const [scores, setScores] = useState<scoreObjects>(undefined);
  const [weightedCharts, setWeightedCharts] = useState<
    ChartDocument<'iidx:SP'>[]
  >([]);

  const { user, accessToken, idToken } = useContext(AuthContext);

  const allSongs = useMemo(
    () => (scores ? [...scores.SP12.songs, ...scores.SP11.songs] : []),
    [scores],
  );

  const allCharts = useMemo(
    () => (scores ? [...scores.SP12.charts, ...scores.SP11.charts] : []),
    [scores],
  );

  const allPbs = useMemo(
    () => (scores ? [...scores.SP12.pbs, ...scores.SP11.pbs] : []),
    [scores],
  );

  const songsKeyedById = useMemo(
    () => keyBy(allSongs, (song) => song.id),
    [allSongs],
  );

  const pbsKeyedByChartId = useMemo(
    () => keyBy(allPbs, (pb) => pb.chartID),
    [scores],
  );

  const chartsWithPbClear = useMemo(
    () =>
      allCharts.filter(
        (chart) =>
          !Object.keys(pbsKeyedByChartId) ||
          pbsKeyedByChartId[chart.chartID]?.scoreData.lamp === 'CLEAR',
      ),
    [allCharts, pbsKeyedByChartId],
  );

  const chartsGroupedByTier: Record<TiersType, ChartDocument[]> = useMemo(
    () =>
      groupBy(allCharts, (chart) =>
        get(chart, 'tierlistInfo.kt-NC.text', 'No Tier'),
      ) as unknown as Record<TiersType, ChartDocument[]>,
    [allCharts],
  );

  const chartsWithClearGroupedByTier = useMemo(
    () =>
      groupBy(
        allCharts.filter(
          (chart) =>
            pbsKeyedByChartId[chart.chartID]?.scoreData.lamp === 'CLEAR',
        ),
        (chart) => get(chart, 'tierlistInfo.kt-NC.text', 'No Tier'),
      ),
    [allCharts],
  );

  const tierNoClearPercentage = useMemo(
    () =>
      Tiers.filter((tier) => tier !== 'No Tier').reduce(
        (newObj, val) => ({
          ...newObj,
          [val]: (
            (chartsWithClearGroupedByTier[val]?.length || 0) /
            (chartsGroupedByTier[val]?.length || 0)
          ).toFixed(2),
        }),
        {},
      ),
    [chartsWithClearGroupedByTier],
  );

  useEffect(() => {
    if (typeof user === 'undefined') {
      navigate('/sign-in');
    }
  }, [user]);

  useEffect(() => {
    if (accessToken && idToken) {
      (async () => {
        const data = await request({
          method: 'POST',
          endpoint: '/oauth-status',
          accessToken,
          idToken,
        });

        setIsOAuth(data.tachiCode);
      })();
    }
  }, [accessToken, idToken]);

  useEffect(() => {
    if (isOAuth) {
      (async () => {
        const data = await request<{
          success: boolean;
          body?: scoreObjects;
        }>({
          method: 'POST',
          endpoint: '/get-scores',
          accessToken,
          idToken,
        });
        if (data.success) {
          setScores(data.body);
          console.log(data.body);
        } else {
          throw new Error('Could not fetch any scores?');
        }
      })();
    }
  }, [isOAuth]);

  const addWeightToCharts = (
    charts: ChartDocument<'iidx:SP'>[],
  ): ChartDocument<'iidx:SP'>[] => {
    const chartsWithWeight = charts.map((chart) => {
      return {
        ...chart,
        weight: Math.random(),
      };
    });

    // If user closer to clearing a tier add weight to charts in tier
    // If very close to clearing tier, add weight to only charts not cleared
    const chartsWithAddedTierWeight = chartsWithWeight.map((chart) => {
      let weightToAdd = Math.random();
      const tierPercentage =
        tierNoClearPercentage[chart.tierlistInfo['kt-NC']?.text || 'No Tier'];

      if (pbsKeyedByChartId[chart.chartID]?.scoreData.lamp !== 'CLEAR') {
        if (tierPercentage === 1) {
          weightToAdd = 0;
        } else if (tierPercentage > 0.875) {
          weightToAdd *= 4;
        } else if (tierPercentage > 0.75) {
          weightToAdd *= 3.75;
        } else if (tierPercentage > 0.625) {
          weightToAdd *= 3.5;
        } else if (tierPercentage > 0.5) {
          weightToAdd *= 3.25;
        } else if (tierPercentage > 0.375) {
          weightToAdd *= 3;
        } else if (tierPercentage > 0.25) {
          weightToAdd *= 2.5;
        } else if (tierPercentage > 0.125) {
          weightToAdd *= 2.25;
        }
      }

      return {
        ...chart,
        weight: (chart.weight += weightToAdd),
      };
    });

    // Recommend songs with lamps that could be improved on
    const chartsWithAddedLampWeight = chartsWithAddedTierWeight.map((chart) => {
      let weightToAdd = Math.random();
      const chartPbLamp = pbsKeyedByChartId[chart.chartID]?.scoreData.lamp;

      if (chartPbLamp === 'NO PLAY') {
        weightToAdd *= 2;
      } else if (chartPbLamp === 'ASSIST CLEAR') {
        weightToAdd *= 1.75;
      } else if (chartPbLamp === 'EASY CLEAR') {
        weightToAdd *= 1.5;
      } else if (chartPbLamp === 'FAILED') {
        weightToAdd *= 1.25;
      } else if (chartPbLamp === 'CLEAR') {
        weightToAdd *= 1;
      }

      return {
        ...chart,
        weight: (chart.weight += weightToAdd),
      };
    });

    const chartsWithAddedPlaytimeWeight = chartsWithAddedLampWeight.map(
      (chart) => {
        let weightToAdd = Math.random();
        const chartPbTime = pbsKeyedByChartId[chart.chartID]?.timeAchieved;
        const currentTime = new Date().valueOf();
        const timeDiffInSeconds = (currentTime - chartPbTime) * 1000;

        if (timeDiffInSeconds > MonthInSeconds * 2) {
          weightToAdd *= 3;
        } else if (timeDiffInSeconds > MonthInSeconds) {
          weightToAdd *= 2;
        } else if (timeDiffInSeconds > MonthInSeconds / 2) {
          weightToAdd *= 1.5;
        } else if (timeDiffInSeconds > MonthInSeconds / 4) {
          weightToAdd *= 1.25;
        }

        return {
          ...chart,
          weight: (chart.weight += weightToAdd),
        };
      },
    );

    return chartsWithAddedPlaytimeWeight.sort((a, b) => b.weight - a.weight);
  };

  useEffect(() => {
    if (tierNoClearPercentage) {
      setWeightedCharts(addWeightToCharts(allCharts));
    }
  }, [tierNoClearPercentage]);

  const getColourForLamp = (lamp: string): string => {
    switch (lamp) {
      case 'CLEAR':
        return '#4682b4';
      case 'EASY CLEAR':
        return '#32cd32';
      case 'ASSIST CLEAR':
        return '#9932cc';
      case 'FAILED':
        return '#AA5555';
      default:
        return '#00000080';
    }
  };

  return (
    <Page title={'Recommend'}>
      {isOAuth === undefined ? (
        <Loading />
      ) : (
        <div className={styles.recommend}>
          {!isOAuth ? (
            <p>
              Please{' '}
              <a href="https://kamaitachi.xyz/oauth/request-auth?clientID=CIa631a6f1cc474efe82e44a6ca0aff8d03d0b3f9e">
                Sign in with Kamaitachi
              </a>
            </p>
          ) : (
            <div>
              {weightedCharts.length <= 0 ? (
                <Loading />
              ) : (
                <>
                  <Button
                    onClick={() =>
                      setWeightedCharts(addWeightToCharts(allCharts))
                    }
                  >
                    Shuffle
                  </Button>
                  <ul>
                    {weightedCharts.map((chart) => (
                      <li
                        key={chart.chartID}
                        style={
                          {
                            '--lamp-color': getColourForLamp(
                              pbsKeyedByChartId[chart.chartID]?.scoreData.lamp,
                            ),
                          } as React.CSSProperties
                        }
                      >
                        <div className={styles.chart}>
                          <img
                            src={`https://cdn.kamaitachi.xyz/game-icons/iidx/${
                              songsKeyedById[chart.songID]?.data.displayVersion
                            }`}
                            alt={
                              songsKeyedById[chart.songID]?.data.displayVersion
                            }
                          />
                          <div className={styles.details}>
                            <div className={styles.name}>
                              {songsKeyedById[chart.songID]?.title ||
                                'Unknown song'}
                            </div>
                            <div className={styles.sub}>
                              <div className={styles.tier}>
                                [
                                {chart.tierlistInfo['kt-NC']?.text
                                  ? `${
                                      chart.tierlistInfo['kt-NC']?.text
                                    } (${Math.floor(
                                      tierNoClearPercentage[
                                        chart.tierlistInfo['kt-NC']?.text ||
                                          'No Tier'
                                      ] * 100,
                                    )}%)`
                                  : `${chart.level}?`}
                                ]
                              </div>
                              <div className={styles.grade}>
                                {pbsKeyedByChartId[chart.chartID]?.scoreData
                                  .grade || '?'}
                              </div>
                              <div className={styles.lamp}>
                                {pbsKeyedByChartId[chart.chartID]?.scoreData
                                  .lamp || 'NO PLAY'}
                              </div>
                              {pbsKeyedByChartId[chart.chartID] && (
                                <div className={styles.time}>
                                  {moment(
                                    pbsKeyedByChartId[chart.chartID]
                                      .timeAchieved,
                                  )
                                    .fromNow()
                                    .replace(/^a/, '1')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Page>
  );
};

export default Recommend;
