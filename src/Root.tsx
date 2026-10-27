import React from 'react';
import {Composition} from 'remotion';
import {GMain, TOTAL} from './g/Main';
export const RemotionRoot: React.FC = () => <Composition id="Gua" component={GMain} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />;
