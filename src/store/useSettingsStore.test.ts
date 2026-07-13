import { beforeEach, describe, expect, it } from 'vitest';

import { useSettingsStore } from './useSettingsStore';

describe('useSettingsStore', () => {
  beforeEach(() => useSettingsStore.getState().reset());

  it('has the documented defaults', () => {
    const s = useSettingsStore.getState();
    expect(s.notifPeriod).toBe(true);
    expect(s.notifOvulation).toBe(true);
    expect(s.notifDaily).toBe(false);
    expect(s.lutealLength).toBe(14);
    expect(s.units).toBe('us');
    expect(s.theme).toBe('light');
  });

  it('sets fields via patch', () => {
    useSettingsStore.getState().set({ theme: 'dark', units: 'metric', notifDaily: true });
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('dark');
    expect(s.units).toBe('metric');
    expect(s.notifDaily).toBe(true);
  });

  it('clamps lutealLength to 10-16', () => {
    useSettingsStore.getState().set({ lutealLength: 3 });
    expect(useSettingsStore.getState().lutealLength).toBe(10);
    useSettingsStore.getState().set({ lutealLength: 99 });
    expect(useSettingsStore.getState().lutealLength).toBe(16);
    useSettingsStore.getState().set({ lutealLength: 12 });
    expect(useSettingsStore.getState().lutealLength).toBe(12);
  });

  it('reset restores defaults', () => {
    useSettingsStore.getState().set({ theme: 'dark', lutealLength: 12 });
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().theme).toBe('light');
    expect(useSettingsStore.getState().lutealLength).toBe(14);
  });
});
