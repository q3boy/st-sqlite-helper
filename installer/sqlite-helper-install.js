(async () => {
  const repository = 'https://github.com/q3boy/st-sqlite-helper';
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
  const source = `<p>正式安装地址：<a href="${repository}" target="_blank" rel="noopener noreferrer">${repository}</a></p>`;
  const errorText = error => (error instanceof Error ? error.message : String(error));
  const report = async (title, message, error) => {
    const detail = error === undefined ? '' : `\n\n详细说明：${errorText(error)}`;
    if (!popup) {
      owner.alert(`${title}\n\n${message}${detail}\n\n手动安装地址：${repository}`);
      return;
    }
    await popup.show.text(
      title,
      `<p>${text(message)}</p>${source}${detail ? `<pre style="white-space:pre-wrap;overflow-wrap:anywhere;text-align:left">${text(detail.trim())}</pre>` : ''}`,
      { okButton: '知道了', allowVerticalScrolling: true },
    );
  };
  const confirmRefresh = async () => {
    const result = await popup.show.confirm(
      '酒馆sqlite助手已安装',
      '<p>插件已安装，刷新页面后生效。是否现在刷新？也可以稍后手动刷新。</p>',
      { okButton: '刷新页面', cancelButton: '稍后刷新' },
    );
    if (result === affirmative) {
      try {
        await triggerSlash('/reload-page');
      } catch (error) {
        await report('请手动刷新页面', '插件已安装，但刷新命令未能执行。请手动刷新页面使插件生效。', error);
      }
    }
  };

  let installed;
  let needsRefresh = false;
  let installationType;
  try {
    const context = owner.SillyTavern?.getContext();
    if (
      typeof context?.Popup?.show?.confirm !== 'function' ||
      typeof context?.Popup?.show?.text !== 'function' ||
      typeof context?.POPUP_RESULT?.AFFIRMATIVE !== 'number'
    ) {
      throw new Error('当前酒馆没有提供所需的确认弹窗接口。');
    }
    popup = context.Popup;
    affirmative = context.POPUP_RESULT.AFFIRMATIVE;
    if (typeof isInstalledExtension !== 'function') throw new Error('当前酒馆助手没有提供扩展安装检查接口。');
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
      return;
    }
    if (typeof isAdmin !== 'function' || typeof installExtension !== 'function' || typeof triggerSlash !== 'function') {
      throw new Error('当前酒馆助手没有提供所需的安装或页面刷新接口。');
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
    `<p>这张角色卡需要酒馆sqlite助手。将从以下正式仓库安装，${scope}完成后需要刷新页面。</p>${source}`,
    { okButton: '安装插件', cancelButton: '取消' },
  );
  if (result !== affirmative) return;
  try {
    const response = await installExtension(repository, installationType);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}\n${await response.text()}`);
  } catch (error) {
    await report('插件安装失败', '请根据下方错误检查后手动安装酒馆sqlite助手。', error);
    return;
  }
  await confirmRefresh();
})();
