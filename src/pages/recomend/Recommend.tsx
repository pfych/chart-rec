import { get, groupBy, keyBy } from 'lodash';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartDocument,
  FolderDocument,
  PBScoreDocument,
  SongDocument,
} from 'tachi-common';
import { AuthContext } from '../../api/AuthContext';
import { request } from '../../api/Request';
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

const Recommend = (): JSX.Element => {
  const navigate = useNavigate();
  const [isOAuth, setIsOAuth] = useState(undefined);
  const [scores, setScores] = useState<scoreObjects>(undefined);
  const [userLevel, setUserLevel] = useState(0);
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

  const chartsWithPbsGroupedByTier: Record<TiersType, ChartDocument[]> =
    useMemo(
      () =>
        groupBy(chartsWithPbClear, (chart) =>
          get(chart, 'tierlistInfo.kt-NC.text', 'No Tier'),
        ) as unknown as Record<TiersType, ChartDocument[]>,
      [chartsWithPbClear],
    );

  const chartsGroupedByTier: Record<TiersType, ChartDocument[]> = useMemo(
    () =>
      groupBy(allCharts, (chart) =>
        get(chart, 'tierlistInfo.kt-NC.text', 'No Tier'),
      ) as unknown as Record<TiersType, ChartDocument[]>,
    [allCharts],
  );

  const tierNoClearPercentage = useMemo(
    () =>
      Tiers.filter((tier) => tier !== 'No Tier').reduce(
        (newObj, val) => ({
          ...newObj,
          [val]: (
            (chartsWithPbsGroupedByTier[val]?.length || 0) /
            (chartsGroupedByTier[val]?.length || 0)
          ).toFixed(2),
        }),
        {},
      ),
    [chartsWithPbsGroupedByTier],
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

  const weightedCharts = useMemo(() => {
    const chartsWithWeight = allCharts.map((chart) => {
      return {
        ...chart,
        weight: Math.random(),
      };
    });

    // If user closer to clearing a tier add weight to charts in tier
    const chartsWithAddedTierWeight = chartsWithWeight.map((chart) => {
      let weightToAdd = Math.random();
      const tierPercentage =
        tierNoClearPercentage[chart.tierlistInfo['kt-NC']?.text || 'No Tier'];

      if (tierPercentage > 0.95) {
        weightToAdd *= 2;
      } else if (tierPercentage > 0.75) {
        weightToAdd *= 1.5;
      } else if (tierPercentage > 0.5) {
        weightToAdd *= 1.25;
      }

      return {
        ...chart,
        weight: (chart.weight += weightToAdd),
      };
    });

    // If user acc was bad on chart add weight to chart
    const chartsWithAddedRankWeight = chartsWithAddedTierWeight.map((chart) => {
      let weightToAdd = Math.random();
      const chartPbGrade = pbsKeyedByChartId[chart.chartID]?.scoreData.grade;

      if (chartPbGrade === 'D') {
        weightToAdd *= 2;
      } else if (chartPbGrade === 'C') {
        weightToAdd *= 1.75;
      } else if (chartPbGrade === 'B') {
        weightToAdd *= 1.5;
      } else if (chartPbGrade === 'A') {
        weightToAdd *= 1.25;
      }

      return {
        ...chart,
        weight: (chart.weight += weightToAdd),
      };
    });

    const chartsWithAddedLampWeight = chartsWithAddedRankWeight.map((chart) => {
      let weightToAdd = Math.random();
      const chartPbLamp = pbsKeyedByChartId[chart.chartID]?.scoreData.lamp;

      if (chartPbLamp === 'ASSIST CLEAR') {
        weightToAdd *= 2;
      } else if (chartPbLamp === 'FAILED') {
        weightToAdd *= 1.75;
      } else if (chartPbLamp === 'NO PLAY') {
        weightToAdd *= 1.5;
      } else if (chartPbLamp === 'EASY CLEAR') {
        weightToAdd *= 1.25;
      }

      return {
        ...chart,
        weight: (chart.weight += weightToAdd),
      };
    });

    return chartsWithAddedLampWeight.sort((a, b) => b.weight - a.weight);
  }, [tierNoClearPercentage]);

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
                <ul>
                  {weightedCharts.map((chart) => (
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
                      {songsKeyedById[chart.songID]?.title || 'Unknown song'}
                      &nbsp;
                      {pbsKeyedByChartId[chart.chartID]?.scoreData
                        ? `[${chart.level}] (${
                            pbsKeyedByChartId[chart.chartID]?.scoreData.grade
                          } 
                      ${pbsKeyedByChartId[chart.chartID]?.scoreData.lamp})`
                        : `[${chart.level}] (NO PLAY)`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </Page>
  );
};

export default Recommend;
