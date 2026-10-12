(() => { const module = {exports:{}};
'use strict';

function searchGuides(guides, query) {
    const terms = String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
    if (!terms.length) return guides;
    return guides.map(guide => {
        const haystack = guide.search.toLocaleLowerCase();
        if (!terms.every(term => haystack.includes(term))) return null;
        const score = terms.reduce((total, term) => total +
            (guide.title.toLocaleLowerCase().includes(term) ? 5 : 0) +
            (guide.keywords.some(keyword => keyword.toLocaleLowerCase().includes(term)) ? 10 : 0), 0);
        return { guide, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.guide.ordinal - b.guide.ordinal).map(item => item.guide);
}

function activityState(activity, now = Date.now()) {
    if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(activity.drop_ends_at)) throw new Error('Activity deadline needs an explicit timezone');
    const deadline = Date.parse(activity.drop_ends_at);
    if (!Number.isFinite(deadline)) throw new Error('Activity deadline must have an explicit valid timestamp');
    const deadlinePassed = Number(now) >= deadline;
    const confirmed = Date.parse(activity.closure_confirmed_on || '');
    const closed = Number.isFinite(confirmed) && confirmed <= Number(now);
    return { deadlinePassed, closed, label: closed ? '活动掉落已结束' : deadlinePassed ? '已到计划截止时间，请查看结束公告' : '公告活动期内', deadline: activity.deadline_text };
}

module.exports = { searchGuides, activityState };

window.ShengyuSearch = module.exports.searchGuides; })();
