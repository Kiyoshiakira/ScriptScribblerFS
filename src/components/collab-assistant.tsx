'use client';
import 'regenerator-runtime/runtime';
import { useState } from 'react';
import CollabHub from './collab-hub';
import CollabSessionStarter from './collab-session-starter';

export default function CollabAssistant() {
  const [sessionActive, setSessionActive] = useState(false);

  if (!sessionActive) {
    return <CollabSessionStarter onStartSession={() => setSessionActive(true)} />;
  }

  return <CollabHub />;
}
