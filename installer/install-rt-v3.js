(async () => {
  const repositories = [
    ['GitHub', 'https://github.com/q3boy/st-sqlite-helper'],
    ['Gitee', 'https://gitee.com/q3boy/st-sqlite-helper.git'],
  ];
  // 顺序仅供内部识别和全部停用时选择提示对象，不向玩家列出版本清单。
  const extensions = [
    { id: 'st-sqlite-helper', name: '酒馆sqlite助手' },
    { id: 'st-sqlite-helper-pub', name: '酒馆sqlite助手' },
    { id: 'st-sqlite-helper-dev', name: '酒馆Sqlite助手（开发版）' },
    { id: 'st-sqlite-helper-test', name: '酒馆Sqlite助手（测试版）' },
  ];
  const owner = window.parent;
  let popup;
  let affirmative;
  const text = value => {
    const element = document.createElement('div');
    element.textContent = String(value);
    return element.innerHTML;
  };
  const source = repositories
    .map(
      ([name, url]) => `<p>${name} 安装地址：<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`,
    )
    .join('');
  const errorText = error => (error instanceof Error ? error.message : String(error));
  const report = async (title, message, error) => {
    const detail = error === undefined ? '' : `\n\n详细说明：${errorText(error)}`;
    if (!popup) {
      owner.alert(
        `${title}\n\n${message}${detail}\n\n手动安装地址：\n${repositories.map(([name, url]) => `${name}：${url}`).join('\n')}`,
      );
      return;
    }
    await popup.show.text(
      title,
      `<p>${text(message)}</p>${source}${detail ? `<pre style="white-space:pre-wrap;overflow-wrap:anywhere;text-align:left">${text(detail.trim())}</pre>` : ''}`,
      { okButton: '知道了', allowVerticalScrolling: true },
    );
  };

  // 固定依赖只在入口检查一次；缺失项一次列全，不进入安装或更新分支。
  const missing = [
    ['isInstalledExtension', typeof isInstalledExtension],
    ['getExtensionType', typeof getExtensionType],
    ['getExtensionStatus', typeof getExtensionStatus],
    ['isAdmin', typeof isAdmin],
    ['installExtension', typeof installExtension],
    ['updateExtension', typeof updateExtension],
    ['triggerSlash', typeof triggerSlash],
  ]
    .filter(([, type]) => type !== 'function')
    .map(([name]) => `酒馆助手：${name}`);
  let context;
  let contextError;
  if (typeof owner.SillyTavern?.getContext !== 'function') missing.unshift('酒馆：SillyTavern.getContext');
  else {
    try {
      context = owner.SillyTavern.getContext();
    } catch (error) {
      contextError = errorText(error);
    }
  }
  if (typeof context?.Popup?.show?.confirm !== 'function') missing.push('酒馆：Popup.show.confirm');
  if (typeof context?.Popup?.show?.text === 'function') popup = context.Popup;
  else missing.push('酒馆：Popup.show.text');
  if (typeof context?.POPUP_RESULT?.AFFIRMATIVE !== 'number') missing.push('酒馆：POPUP_RESULT.AFFIRMATIVE');
  if (missing.length || contextError) {
    await report(
      '安装引导无法运行',
      '请更新酒馆或酒馆助手，并确认酒馆助手已启用且加载成功后重新运行安装引导。也可按下方地址手动安装。',
      [
        missing.length ? `缺少所需接口或常量：\n${missing.join('\n')}` : '',
        contextError ? `读取酒馆上下文失败：${contextError}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    );
    return;
  }
  affirmative = context.POPUP_RESULT.AFFIRMATIVE;

  const confirmRefresh = async (action = '安装') => {
    const result = await popup.show.confirm(
      `酒馆sqlite助手已${action}`,
      `<p>插件已${action}，刷新页面后生效。是否现在刷新？也可以稍后手动刷新。</p>`,
      { okButton: '刷新页面', cancelButton: '稍后刷新' },
    );
    if (result === affirmative) {
      try {
        await triggerSlash('/reload-page');
      } catch (error) {
        await report('请手动刷新页面', `插件已${action}，但刷新命令未能执行。请手动刷新页面使插件生效。`, error);
      }
    }
  };
  const checkForUpdates = async () => {
    const id = 'st-sqlite-helper';
    let type;
    try {
      type = getExtensionType(id);
      if (!['local', 'global'].includes(type)) throw new Error('无法确定插件的安装范围。');
      const info = await getExtensionStatus(id);
      if (!info || typeof info.is_up_to_date !== 'boolean') throw new Error('酒馆返回的扩展更新信息格式不正确。');
      if (info.is_up_to_date) return;
      if (type === 'global') {
        if (!isAdmin()) {
          await popup.show.text(
            '酒馆sqlite助手有更新',
            '<p>插件安装供所有账号使用，需要由酒馆管理员更新。请联系管理员在扩展管理中更新，完成后刷新页面。</p>',
            { okButton: '知道了' },
          );
          return;
        }
      }
    } catch (error) {
      await report('无法检查插件更新', '请在扩展管理中手动检查酒馆sqlite助手的更新。', error);
      return;
    }
    const scope = type === 'global' ? '更新会影响酒馆中的所有账号。' : '更新仅影响当前账号。';
    const result = await popup.show.confirm(
      '酒馆sqlite助手有更新',
      `<p>发现插件有更新，是否现在更新？${scope}完成后需要刷新页面，也可以稍后在扩展管理中更新。</p>`,
      { okButton: '更新插件', cancelButton: '稍后更新' },
    );
    if (result !== affirmative) return;
    try {
      const response = await updateExtension(id);
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}\n${await response.text()}`);
    } catch (error) {
      await report('插件更新失败', '请根据下方错误在扩展管理中手动更新酒馆sqlite助手。', error);
      return;
    }
    await confirmRefresh('更新');
  };

  let installed;
  let needsRefresh = false;
  let installationType;
  try {
    installed = extensions.filter(extension => isInstalledExtension(extension.id));
    if (!installed.length) {
      // 安装成功后暂不刷新时，助手的页面缓存不会更新；先用原生发现接口核对。
      const response = await fetch('/api/extensions/discover', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}\n${await response.text()}`);
      const discovered = await response.json();
      if (
        !Array.isArray(discovered) ||
        !discovered.every(
          extension =>
            extension && typeof extension.name === 'string' && ['local', 'global', 'system'].includes(extension.type),
        )
      ) {
        throw new Error('酒馆返回的扩展安装列表格式不正确。');
      }
      installed = extensions.filter(extension => discovered.some(item => item.name === `third-party/${extension.id}`));
      needsRefresh = installed.length > 0;
    }
    if (installed.length) {
      const disabled = context.extensionSettings?.disabledExtensions;
      if (!Array.isArray(disabled) || !disabled.every(name => typeof name === 'string')) {
        throw new Error('无法读取酒馆的扩展启停设置。');
      }
      if (installed.every(extension => disabled.includes(`third-party/${extension.id}`))) {
        await popup.show.text(
          '请启用酒馆sqlite助手',
          `<p>已安装酒馆sqlite助手，但扩展已停用。请到扩展管理中启用“${text(installed[0].name)}”，再刷新页面。</p>`,
          { okButton: '知道了' },
        );
        return;
      }
      if (needsRefresh) await confirmRefresh();
      else if (
        installed.some(extension => extension.id === 'st-sqlite-helper') &&
        !disabled.includes('third-party/st-sqlite-helper')
      ) {
        await checkForUpdates();
      }
      return;
    }
    installationType = isAdmin() ? 'global' : 'local';
  } catch (error) {
    await report(
      '无法完成安装检查',
      '请在扩展管理中核对是否已经安装并启用酒馆sqlite助手，需要时按下方地址手动安装。',
      error,
    );
    return;
  }

  const scope = installationType === 'global' ? '安装后酒馆中的所有账号都可使用。' : '安装后仅当前账号可使用。';
  const result = await popup.show.confirm(
    '安装酒馆sqlite助手',
    `<p>这张角色卡需要酒馆sqlite助手。优先从 GitHub 安装，失败后自动尝试 Gitee。${scope}完成后需要刷新页面。</p>${source}`,
    { okButton: '安装插件', cancelButton: '取消', allowVerticalScrolling: true },
  );
  if (result !== affirmative) return;
  const failures = [];
  for (const [name, url] of repositories) {
    try {
      const response = await installExtension(url, installationType);
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}\n${await response.text()}`);
    } catch (error) {
      failures.push(`${name}：${errorText(error)}`);
      continue;
    }
    await confirmRefresh();
    return;
  }
  await report(
    '插件安装失败',
    'GitHub 和 Gitee 均未能完成安装。请根据下方错误检查后手动安装酒馆sqlite助手。',
    failures.join('\n\n'),
  );
})();
