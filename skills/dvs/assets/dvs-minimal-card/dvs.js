(async () => {
  await waitGlobalInitialized('DVS');
  const dispose = await DVS.register({
    scriptId: getScriptId(),
    uniqueKeys: { 人物: ['姓名'], 场景: ['编号'], 物品: ['名称'] },
    narrativePrepare: ({ tables }) => tables,
    beforeGen: (_state, tables) => tables,
  });
  $(window).on('pagehide', dispose);
})();
