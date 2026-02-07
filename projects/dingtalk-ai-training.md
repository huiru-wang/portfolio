---
project_id: dingtalk-ai-training
title: 钉钉智能人事 - AI培训Agent
description: 基于钉钉智能人事平台，利用AI技术，为企业员工提供个性化的AI培训服务。
tech_stack: [LLM, Agent, AI, Java, MySQL]
role: [项目负责任， 核心开发]
---

## 产品概览

![](/images/project-multi-agent-product.png)

专注于培训领域的以文档为核心实现`会话+产出`的 Agent，一个完整会话包含 3 个模块：

- 知识库：用户可以上传文档作为整个会话的信息源（pdf、docx、md、txt）
- 对话：模型交互、任务下发；
- 任务列表：Agent 提供 PPT 生成、课程视频、考试出题等有结果产出的能力，在任务列表中输出给用户；

## 主子 Agent 架构设计

![Agent调度模型](project-multi-agent-arch.png)

设计原则：

1. <font color="#f79646">子 Agent 能力边界要非常清晰，之间不能有能力重叠</font>，如果两个 Agent 都能处理同一个任务，主 Agent 就会出现决策问题、调度问题、逻辑冲突；（微服务的划分逻辑类似，依然是：<font color="#f79646">高内聚低耦合</font>）；
2. 子 Agent 能力不能太多，避免全能型子 Agent；
3. 子 Agent 应该是无状态的，像一个工具被调度；如果子 Agent 理解会话历史，主 Agent 下发指令有可能被影响；（并不是信息给得越多，子 Agent 跑得越准）
4. <font color="#f79646">主 Agent 要极度清醒（强逻辑）、子 Agent 要极度专业（窄领域高执行）</font>
5. 主子 Agent 交互协议需要一些设计，不能是简单的 query、指令等；（交互协议标准化）

## 主 Agent 设计

- 意图识别：识别用户问题（询问培训相关的业务问题、制作课程、考试出题）
- 任务拆解原则：<font color="#4bacc6">拆出的每一个子任务必须是子 Agent 能力范围内的，不能给子 Agent 模糊任务；</font>
- 精准路由：主 Agent 的逻辑能力 + 子 Agent 能力清晰
- 思考模型：reAct 执行模式（`Thought`、`Action`、`Observation`）
  ![](/images/project-multi-agent-react.png)
- 子 Agent 调度：限定 LLM 交互消息格式，

```json
{
  "Thought": "当前这一步的思考",
  "Action": {
    "AgentName": "子Agent名称",
    "Args": {
      "Instruction": "给到子Agent的指令",
      "Context": "给到子Agent的参考、额外信息、补充",
      "constraints": {
        "a": "一些特定任务的常量（比如如果要对文档理解，则这里可以传递文档id）、或者用户的原始query"
      }
    }
  },
  "Final_Answer": "主Agent最终得出的给到用户的结论"
}
```

## 子 Agent 设计

核心原则：

- 高内聚、低耦合，有清晰的能力边界，拒绝全能 Agent；
- 子 Agent 之间的能力绝对不能重叠；如果两个 Agent 都能处理同一个任务，主 Agent 就会出现决策问题、调度问题、逻辑冲突
- 能力是闭环的：能够解决一个原子问题；

可以采用一些思维模式：

- Propmt 层面思维链：低成本、速度快，适合简单任务，直接产出结论的；
- 显示的流程拆解（WorkFlow）：中成本，适合固定、复杂产出；
- 自我反思修正（reAct）：高成本、速度慢，适合任务不是很明确，需要高质量把控；

<font color="#f79646">课程 Agent</font>：任务固定（WorkFlow）

- PPT 课程：分析文档 -> 梳理大纲 -> 按页生成 -> 合成 PPT
- 视频课程：完成 PPT 后 -> PPT 按页生图 -> 按页生成口播稿子 -> 生成音频 -> 合成音频 -> 合成视频
  <font color="#f79646">专家 Agent</font>：需要根据具体的用户问题思考解决方案，并且多轮思考保证回答质量（reAct）
  <font color="#f79646">考试 Agent</font>：类似于课程 Agent；

## Agent 交互以及记忆

区别于会话聊天记录（`List<Message>`），Agent 记忆的本质是：`结构化的状态机，而不是对话流`；

多 Agent 架构中，主、子 Agent 记忆设计的考量点：

1. 注意力：
   1. 主 agent 注意力在于用户任务、整体规划、单点路由、清晰下达任务；对于子 Agent 的结果只需要关注执行结论、成功失败；不需要关注太多执行细节；
   2. 子 agent 注意力在于接受明确的任务；因此不需要理解太多上下文，但是任务要清晰，任务关联的上下文还是必要的；
2. 成本控制：Agent 记忆是有上限的，需要采取摘要、压缩、裁剪等操作；（通常取决于大模型的上下文、成本控制）
3. 连贯性：核心在于 Agent 之间的交互消息；当前项目的实现是，限定交互消息格式，强制 Agent 之间交互信息：
   1. 主 -> 子：指令清晰、上下文简洁
   2. 子 -> 主：结论先行，信息提炼压缩
   3. `context`、`summary`是保证了连贯性的核心，让 Agent 之间的交互更丰富、更对其、减少信息丢失；

主 -> 子：

```json
{
  "instruction": "给到子Agent的指令",
  "context": "给到子Agent的参考、额外信息、当前任务进度、状态等等（取决于Prompt设计）",
  "constraints": {
    "a": "一些特定任务的常量（比如如果要对文档理解，则这里可以传递文档id）、或者用户的原始query"
  }
}
```

子 -> 主：

```json
{
  "final_answer": "给到主Agent的结论",
  "summary": "给到主Agent执行简单总结" // 不需要太多细节，用于主Agent判断是否跑偏；
}
```

## 会话执行过程

![交互流程](/images/project-multi-agent-case.png)

## 消息交互设计

**约定消息类型**：将会话期间所有产生的消息进行分类管理，同时可以控制前端的消息 UI

- `SCHEDULING`、`THINGKING`、`OBSERVATION`：在前端选择性透出；
- `TOOL_CALL`、`TOOL_CALL_RESULT`：只是提示前端执行了工具（具体内容一般不透出）
- `FINAL_ANSWER`：作为最终的消息透出给用户；
- `TASK_SIGNAL`：作为任务创建的信号，前端感知后可以提示用户、触发异步任务的轮询等；

```java
public enum MessageType {

	// 心跳消息：维持长链接
	HEARTBEAT,

	// 思考
	THINGKING,

	// 调度消息
	SCHEDULING,

	// 观察结果（子Agent结论）
	OBSERVATION,

	// 执行工具
	TOOL_CALL,

	// 工具结果
	TOOL_CALL_RESULT,

	// 最终回答
	FINAL_ANSWER,

	// 任务出发信号，前端可以根据信号执行一些提示、交互等
	TASK_SIGNAL,

	// 日志
	LOG,

	// 错误
	ERROR;
}
```

**Printer 设计**：Printer 是输出源的抽象

```java
public interface Printer {

	// 发送消息：触发对象、消息类型、消息内容
	void send(String object, MessageType messageType, String message);

	// 异常信息
	void error(String object, String code, String errorMessage);

	// 关闭
	void close();
}
```

比如封装一个钉钉内部的 LWP 接口，作为用户交互的输出源；

```java
public class LWPPrinter implements Printer {

	// LWP输出源
	private final StreamObserver<String> streamObserver;

    // 限定可以透出的消息类型
	private final Set<MessageType> ACCEPT_MESSAGE_TYPES = Sets.newHashSet(
		MessageType.HEARTBEAT,
		MessageType.THINGKING,
		MessageType.ERROR,
		MessageType.SCHEDULING,
		MessageType.TASK_SIGNAL,
		MessageType.FINAL_ANSWER
	)

	@Override
	public void send(String object, MessageType messageType, String message) {

		if (!ACCEPT_MESSAGE_TYPES.contains(messageType)) {
			return;
		}
		// 发送正常消息
		String content = new JSONObject()
			.fluentPut("object", object)
			.fluentPut("messageType", messageType)
			.fluentPut("message", message)
			.toJSONString();
		this.streamObserver.next(content);
	}

	@Override
	public void error(String object, String code, String errorMessage) {
		// 错误
		this.streamObserver.onError(content);
	}

	@Override
	public void close() {
		// 关闭
		this.streamObserver.onComplete();
	}
}
```

## 会话管理

这里的会话管理指用户视角的会话（不包括模型记忆）；核心 3 点：

| **消息类型**                      | **实时表现 (Streaming)**                        | **最终存储 (Persistence)**            | **目的**       |
| --------------------------------- | ----------------------------------------------- | ------------------------------------- | -------------- |
| **User Message**                  | 立即显示                                        | <font color="#f79646">原始存储</font> | 记录用户意图   |
| **Thought/Action/Observation 等** | **临时显示**（如“正在搜索...”，“正在分析财报”） | **通常丢弃**                          | 减少等待焦虑   |
| **Final Answer**                  | **流式打字输出**                                | <font color="#f79646">完整存储</font> | 最终交付的结果 |
