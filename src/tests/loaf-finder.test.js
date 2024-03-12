// SET inTesting to true in loaf-finder.js before running the tests.

const {describe, expect, it} = require("@jest/globals");
const loafFinderForTests = require('../loaf-finder');
const {
    processLoafEntry,
    filterScriptIntoGroups,
    filterLoafIntoGroups,
    addLoafToGroup,
    isScriptInGroup,
    addScriptToGroup,
    crossLongTasksWithLoafs,
    groupASearchList,
    groupBSearchList,
    groupALoafs,
    groupBLoafs,
    loafMetaData,
    groupALoafsOverview,
    groupAScriptsSummary,
    longTasks,
    groupALongTasksScripts,
    groupALongTasks,
} = loafFinderForTests;

describe('LoAF-Finder', function () {

    describe('filterScriptIntoGroups', function () {
        it('should filter to A and B accordingly', function () {
            const mockScript = {
                "sourceLocation": "https://not.taboola.real/libtrc/demo/loader.js:0"
            };
            groupASearchList.push('taboola');
            const resultA = filterScriptIntoGroups(mockScript);
            expect(resultA.groupA).toBe(true);
            expect(resultA.groupB).toBe(false);
            groupASearchList.pop();

            groupASearchList.push('test');
            groupBSearchList.push('taboola');
            const resultB = filterScriptIntoGroups(mockScript);
            expect(resultB.groupA).toBe(false);
            expect(resultB.groupB).toBe(true);
            groupASearchList.pop();
            groupBSearchList.pop();
        });
        it('should filter to A if noting in groupASearchList', function () {
            expect(groupASearchList.length).toBe(0);
            const mockScript = {
                "sourceLocation": "https://not.taboola.real/libtrc/test-demo/loader.js:0"
            };
            const result = filterScriptIntoGroups(mockScript);
            expect(result.groupA).toBe(true);
            expect(result.groupB).toBe(false);
        });
    });

    describe('filterLoafIntoGroups', function () {
        it('should filter the loaf to groupALoafs or groupBLoafs accordingly', function () {
            const mockedLoaf = {}
            filterLoafIntoGroups(mockedLoaf, isGroupA = true, isGroupB = false);
            expect(groupALoafs.length).toBe(1);
            expect(groupBLoafs.length).toBe(0);
            groupALoafs.pop();

            filterLoafIntoGroups(mockedLoaf, isGroupA = false, isGroupB = true);
            expect(groupALoafs.length).toBe(0);
            expect(groupBLoafs.length).toBe(1);
            groupBLoafs.pop();

            filterLoafIntoGroups(mockedLoaf, isGroupA = true, isGroupB = true);
            expect(groupALoafs.length).toBe(1);
            expect(groupBLoafs.length).toBe(1);
            groupALoafs.pop();
            groupBLoafs.pop();
        });
    });

    describe('addLoafToGroup', function () {
        it('should add the loaf to the right group', function () {
            const mockedLoafA = {}
            addLoafToGroup('A', mockedLoafA);
            expect(mockedLoafA.group).toBe('A');

            expect(groupALoafs.length).toBe(1);
            expect(groupBLoafs.length).toBe(0);
            groupALoafs.pop();

            const mockedLoafB = {}
            addLoafToGroup('B', mockedLoafB);
            expect(mockedLoafB.group).toBe('B');
            expect(groupALoafs.length).toBe(0);
            expect(groupBLoafs.length).toBe(1);
            groupBLoafs.pop();

            const mockedLoafAB = {group: 'A'};
            addLoafToGroup('B', mockedLoafAB);
            expect(mockedLoafAB.group).toBe('A+B');
            expect(groupBLoafs.length).toBe(1);


        });
    });

    describe('isScriptInGroup', function () {
        it('should return true if the script is in the group', function () {
            groupASearchList.push('taboola');
            const mockedScriptA = {
                "sourceLocation": "https://not.taboola.real/libtrc/test-demo/loader.js:0"
            };
            const shouldBeInGroup = isScriptInGroup(groupASearchList, mockedScriptA);
            const shouldNotBeInGroupB = isScriptInGroup(groupBSearchList, mockedScriptA);
            expect(shouldBeInGroup).toBe(true);
            expect(shouldNotBeInGroupB).toBe(false);
            groupASearchList.pop();

        });
    });

    describe('loafMetaData', function () {
        it('should update the loafMetaData object', function () {
            const mockedEntry = {
                blockingDuration: 1,
                duration: 2,
                scripts: [{}, {}, {}]
            };
            processLoafEntry(mockedEntry);
            expect(loafMetaData.totalBlockingDurationForAllLoafs).toBe(1);
            expect(loafMetaData.totalDurationForAllLoafs).toBe(2);
            expect(loafMetaData.totalNumberOfScriptsInAllLoafs).toBe(3);
            expect(loafMetaData.totalNumberOfLoafs).toBe(1);
        });
    });

    describe('addScriptToGroup', function () {
        const scriptType = 'A';
        const mockedScript = {
            sourceURL: "https://not.taboola.real/libtrc/test-demo/loader.js:0",
            id: 1,
            loafId: 1,
            duration: 2,
            compileDuration: 3,
            executionDuration: 4,
        }

        addScriptToGroup(scriptType, mockedScript);

        it('should update scriptsSummary', function () {
            const scriptInSummary = groupAScriptsSummary[mockedScript.sourceURL];
            expect(scriptInSummary).toBeDefined();
            expect(scriptInSummary.source).toBe(mockedScript.sourceURL);
            expect(scriptInSummary.loafsIds.length).toBe(1);
            expect(scriptInSummary.totalDuration).toBe(2);
            expect(scriptInSummary.totalCompileDuration).toBe(3);
            expect(scriptInSummary.totalExecutionDuration).toBe(4)
            expect(scriptInSummary.isInNumberOfLoafs).toBe(1);
        });

        it('should update loafsOverview', function () {
            expect(groupALoafsOverview.group).toBe('A');
            expect(groupALoafsOverview.numberOfScripts).toBe(1);
            expect(groupALoafsOverview.longestScriptId).toBe(1);
            expect(groupALoafsOverview.totalDuration).toBe(2);
            expect(groupALoafsOverview.totalCompileDuration).toBe(3);
            expect(groupALoafsOverview.totalExecutionDuration).toBe(4);
        });
    });

    describe('crossLongTasksWithLoafs', function () {
        it('should update the longtask object', function () {
            const script = {
                sourceURL: "https://not.taboola.real/libtrc/test-demo/loader.js:0",
                id: 1,
                loafId: 1,
                startTime: 2,
                endTime: 3,
            }
            const loaf = {
                id: 1,
                startTime: 0,
                endTime: 10,
                scripts: [script],
                longTasks: []
            };
            const longTask = {
                startTime: 1,
                endTime: 9,
            };
            groupALoafs.push(loaf);
            longTasks.push(longTask);
            crossLongTasksWithLoafs();
            expect(groupALongTasks[0].loafId).toBe(1);
            expect(script.longTaskId).toBe(0);
            expect(groupALongTasksScripts.length).toBe(1);
            expect(groupAScriptsSummary[script.sourceURL].isInNumberOfLongTasks).toBe(1);
            expect(loaf.longTasks.length).toBe(1);
            expect(groupALongTasks.length).toBe(1);
            groupALoafs.pop();
            longTasks.pop();
        });
    });
});
