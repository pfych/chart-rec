import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { ChartDocument, PBScoreDocument, SongDocument } from 'tachi-common';
import { Context } from '../api/Context';
import ChartList from '../components/chart-list/ChartList';
import ChartRecommend from '../components/chart-recomend/ChartRecommend';
import Page from '../components/page/Page';
import Token from '../components/token/Token';

const baseUrl = 'https://kamaitachi.xyz/api/v1';
const game = 'iidx';
const playType = 'SP';
const folderId =
  'F7aaf1fe3b7bc5a346106a596e67ae2c86462c671d11c7f1db1422d8e7a421735';

const Home = (): JSX.Element => {
  const [userId, setUserId] = useState('318');
  const [token, setToken] = useState('');
  const [pbs, setPbs] = useState<PBScoreDocument[] | undefined>(undefined);
  const [charts, setCharts] = useState<ChartDocument[] | undefined>(undefined);
  const [songs, setSongs] = useState<SongDocument<'iidx'>[] | undefined>(
    undefined,
  );

  const pbsUrl = `${baseUrl}/users/${userId}/games/${game}/${playType}/folders/${folderId}`;
  const chartsUrl = `${baseUrl}/games/${game}/${playType}/folders/${folderId}`;

  const getData = useCallback(async () => {
    if (!token) return;

    const config = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const userPbs = (await axios(pbsUrl, config)).data.body;
    const folderInfo = (await axios(chartsUrl, config)).data.body;

    setPbs(userPbs.pbs);
    setCharts(folderInfo.charts);
    setSongs(folderInfo.songs);
  }, [chartsUrl, pbsUrl, token]);

  useEffect(() => {
    (async () => await getData())();
  }, [getData]);

  return (
    <Page title="Home">
      <Context.Provider
        value={{
          userId,
          setUserId,
          token,
          setToken,
          pbs,
          setPbs,
          charts,
          setCharts,
          songs,
          setSongs,
        }}
      >
        {charts && songs && pbs ? (
          <ChartRecommend />
        ) : (
          <p>
            Right now, until Kamaitachi enables CORS this site will not work on
            most browsers. Please disable CORS as a temp work around!
            <br />
            Kamaitachi is aware of this issue and a fix is in the pipeline.
            <br />
            (This error also appears if the API fetch is taking a bit!)
          </p>
        )}
        <ChartList />
        <Token />
      </Context.Provider>
    </Page>
  );
};

export default Home;
