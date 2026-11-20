export interface MemoryConfig {
    记忆模式: '完整' | '精选';
    时间地点要求: boolean;
    写作要求: string;
    模型配置: string;
    楼层记忆: {
        短总结字数: number;
        摘要字数: number;
        原文楼层: number;
    };
    角色记忆: {
        增量字数: number;
    };
    地点记忆: {
        增量字数: number;
    };
    模块: {
        角色资料: {
            开启: boolean;
            最大字数: number;
        };
        地点资料: {
            开启: boolean;
            最大字数: number;
        };
        物品记录: {
            开启: boolean;
            最大字数: number;
        };
        剧情线索: {
            开启: boolean;
            最大字数: number;
        };
    };
    压缩: {
        楼层: {
            最大记录数: number;
            处理记录数: number;
        };
        阶段: {
            最大记录数: number;
            处理记录数: number;
            阶段总结字数: number;
        };
        背景: {
            最大字数: number;
            压缩后字数: number;
        };
        角色记忆: {
            最大字数: number;
            压缩后字数: number;
        };
        地点记忆: {
            最大字数: number;
            压缩后字数: number;
        };
    };
}
type PartialFields<T> = {
    [K in keyof T]?: T[K] extends object ? PartialFields<T[K]> : T[K];
};
export type MemoryConfigPatch = PartialFields<MemoryConfig>;
export interface L1FloorDigest {
    楼号: number;
    短总结: string;
    详细摘要: string;
}
export interface L2StageSummary {
    起始楼: number;
    结束楼: number;
    阶段总结: string;
}
export interface L3StoryBackground {
    键: '回顾';
    故事背景: string;
}
export type CharacterRelations = Record<string, string>;
export interface EntityMemoryUpdate {
    新增别名?: string[];
    新增记忆: string;
}
export interface CharacterMemoryUpdate extends EntityMemoryUpdate {
    关系变化: CharacterRelations;
}
export interface EntityMemoryRow {
    名称: string;
    别名: string;
    档案: string;
    记忆: string;
}
export interface CharacterMemoryRow extends EntityMemoryRow {
    关系: string;
}
export interface CharacterMemorySnapshot extends EntityMemoryRow {
    关系: CharacterRelations;
}
export interface ItemMemory {
    名称: string;
    描述: string;
    状态: string;
    数量: string;
}
export interface PlotClue {
    名称: string;
    状态: '待触发' | '已触发' | '已完结';
    内容: string;
}
export interface MemoryUpdateResult {
    楼层摘要: Pick<L1FloorDigest, '短总结' | '详细摘要'>;
    角色记忆: Record<string, CharacterMemoryUpdate>;
    地点记忆: Record<string, EntityMemoryUpdate>;
    角色档案?: Record<string, string>;
    地点档案?: Record<string, string>;
    物品?: Record<string, Omit<ItemMemory, '名称'>>;
    剧情线索?: Record<string, Omit<PlotClue, '名称'>>;
}
export interface MemoryCompressionResult {
    阶段总结?: {
        更新阶段: L2StageSummary | null;
        新增阶段: L2StageSummary[];
    };
    故事背景?: string;
    角色记忆压缩?: Record<string, string>;
    地点记忆压缩?: Record<string, string>;
}
export interface MemorySnapshot {
    楼层摘要: L1FloorDigest[];
    阶段总结: L2StageSummary[];
    故事背景: string;
    角色记忆: CharacterMemorySnapshot[];
    地点记忆: EntityMemoryRow[];
    物品: ItemMemory[];
    剧情线索: PlotClue[];
}
export type MemoryWindowTarget = {
    kind: 'entity';
    entityKind: '角色' | '地点' | '物品' | '线索';
    name: string;
} | {
    kind: 'floor';
    floor: number;
} | {
    kind: 'stage';
    start: number;
} | {
    kind: 'background';
};
export {};
