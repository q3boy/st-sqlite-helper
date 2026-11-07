// 将本示例的 preNarrativeUi 项合并到角色卡已有的 DVS.register 调用中。
const exampleRequests = {
  initial() {
    return {
      messages: [{ role: 'user', content: '根据最近正文和本轮输入，写一段简短访客资料。\n最近正文：[[DVS_PREV_NARRATIVE]]\n本轮输入：[[DVS_USER_INPUT]]' }],
      outputFormat: 'text',
    };
  },
  regenerate(_context, { description, requirement }) {
    return {
      messages: [
        { role: 'user', content: '根据最近正文、本轮输入和调整要求，返回完整的访客资料。\n最近正文：[[DVS_PREV_NARRATIVE]]\n本轮输入：[[DVS_USER_INPUT]]' },
        { role: 'assistant', content: description },
        { role: 'user', content: requirement || '请重新构思另一份符合本轮情境的访客资料。' },
      ],
      outputFormat: 'text',
    };
  },
};

async function sendExampleRequest(context, buildRequest, input) {
  const request = await buildRequest(context, input);
  return context.requestModel({
    ...request,
    messages: request.messages.map(message => ({ ...message, content: context.prompt.expand(message.content) })),
  });
}

const exampleInteraction = {
  key: 'visitor',
  condition: '玩家明确邀请一位新访客进入书店时触发。',
  narrativeEntriesSkip: ['自动访客生成'],
  component: {
    mount(container, ctx) {
      const title = document.createElement('p');
      title.textContent = `确认访客资料（玩家输入：${ctx.userInput}）`;
      const input = document.createElement('textarea');
      input.value = ctx.result?.description ?? '一位喜欢旧书的访客';
      input.setAttribute('aria-label', '访客资料');
      const requirement = document.createElement('textarea');
      requirement.setAttribute('aria-label', '调整要求');
      requirement.placeholder = '填写希望修改或保留的内容';
      let hasCandidate = ctx.result !== undefined;
      const status = document.createElement('p');
      const generate = document.createElement('button');
      generate.textContent = '生成候选';
      const confirm = document.createElement('button');
      confirm.textContent = '确认';
      const cancel = document.createElement('button');
      cancel.textContent = '取消';
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.5em;';
      for (const button of [generate, confirm, cancel]) {
        button.className = 'menu_button';
        button.style.cssText = 'width:auto;white-space:nowrap;';
      }
      actions.append(generate, confirm, cancel);
      generate.onclick = async () => {
        generate.disabled = true;
        status.textContent = '正在生成候选…';
        try {
          const response = await sendExampleRequest(
            ctx,
            hasCandidate ? exampleRequests.regenerate : exampleRequests.initial,
            { description: input.value, requirement: requirement.value },
          );
          if (!ctx.signal.aborted) {
            input.value = response.content;
            hasCandidate = true;
            status.textContent = '可编辑候选后确认。';
          }
        } catch (error) {
          if (!ctx.signal.aborted) status.textContent = `生成失败：${error.message}`;
        } finally {
          if (!ctx.signal.aborted) generate.disabled = false;
        }
      };
      confirm.onclick = () => ctx.complete({ description: input.value });
      cancel.onclick = () => ctx.cancel();
      container.append(title, input, requirement, status, actions);
      return () => container.replaceChildren();
    },
    mountResult(container, result) {
      const text = document.createElement('p');
      text.textContent = `已确认访客：${result.description}`;
      container.append(text);
      return () => text.remove();
    },
    toPrompt(result) {
      return `玩家已确认访客资料：${result.description}。请按此继续正文。`;
    },
  },
};
