///////////SETTINGS////////////////
const promptDownloadsMessage = true;
let groupASearchList = []; //Enter keywords for group A **KEEP GROUP A EMPTY TO GET ALL LOAF ENTRIES INTO GROUP A WITHOUT FILTERING**
let groupBSearchList = []; //Enter keywords for group B **THIS CAN BE USED ALSO WHEN GROUP A IS EMPTY**
let shouldDownloadMainReport = false; //Set to true if you want to download the main report.
let shouldDownloadAllOtherReport = false; //Set to true if you want to download all other reports.
const keysToIgnoreInReports = ['originalEntry', 'longTasks', 'scripts', 'loafs', 'rawEntry'];
const timeToWaitForData = 1000; //Timeout in ms to wait before processing the data.
const timeToObserve = 5000; //Timeout in ms to observe the long animation frame and long tasks entries before disconnecting observers.
const inTesting = false; //Set to true when running tests.
///////////////////////////////////
///////////DATA OBJECTS///////////

const longTasks = [];
const allProcessedEntries = [];
const allOriginalLoAFs = [];

//Group A Data:
const groupAScripts = [];
const groupAScriptsSummary = {};
const groupALoafs = [];
const groupALongTasksScripts = [];
const groupALongTasks = [];
const GROUP_A = 'A';

//Group B Data:
const groupBScripts = [];
const groupBScriptsSummary = {};
const groupBLoafs = [];
const groupBLongTasksScripts = [];
const groupBLongTasks = [];
const GROUP_B = 'B';

//Sums of all LoAF entries:
const loafMetaData = {
    totalNumberOfLoafs: 0,
    totalBlockingDurationForAllLoafs: 0,
    totalDurationForAllLoafs: 0,
    totalNumberOfScriptsInAllLoafs: 0,
}

//Group A LoAF entries sums:
const groupALoafsOverview = initGroupOverview(GROUP_A);

//Group B LoAF entries sums:
const groupBLoafsOverview = initGroupOverview(GROUP_B);

///////////////////////////////////
///////////OBSERVERS///////////
//This function observes the long animation frame and long tasks entries and starts the processing chain:
function observeAndProcessEntries() {
    const loafObserver = initPerformanceObserver(processLoafEntry, "long-animation-frame");
    const longTasksObserver = initPerformanceObserver((entry) => {
        entry.endTime = entry.startTime + entry.duration;
        longTasks.push(entry);
    }, "longtask");

    setTimeout(() => {
        loafObserver.disconnect();
        longTasksObserver.disconnect();
        cleanup();
    }, timeToObserve)

}

///////////////////////////////////
///////////DATA PROCESSING///////////

//ID for each loaf entry:
let loafCounter = 1;

//This function processes each loaf entry, adds fields and creates a new "loaf" object.
function processLoafEntry(entry) {
    const {startTime, duration, renderStart, styleAndLayoutStart} = entry;
    const loaf = {};
    const endTime = startTime + duration;
    const workDuration = renderStart ? renderStart - startTime : duration;
    const styleAndLayoutDuration = styleAndLayoutStart ? endTime - styleAndLayoutStart : 0;
    const RenderDuration = renderStart ? (startTime + duration) - renderStart : 0
    const renderPreLayoutDuration = styleAndLayoutStart - renderStart;

    //Collecting data for the sums of all LoAF entries:
    loafMetaData.totalBlockingDurationForAllLoafs += entry.blockingDuration || 0;
    loafMetaData.totalDurationForAllLoafs += entry.duration || 0;
    loafMetaData.totalNumberOfScriptsInAllLoafs += entry.scripts.length;
    loafMetaData.totalNumberOfLoafs += 1;

    // The order here will set the order of the columns in the csv report files:
    loaf.id = ++loafCounter;
    loaf.group = "";
    loaf.blockingDuration = entry.blockingDuration;
    loaf.startTime = startTime;
    loaf.endTime = endTime;
    loaf.workDuration = workDuration;
    loaf.duration = duration;
    loaf.renderPreLayoutDuration = renderPreLayoutDuration;
    loaf.renderStart = renderStart;
    loaf.renderDuration = RenderDuration;
    loaf.styleAndLayoutStart = styleAndLayoutStart;
    loaf.styleAndLayoutDuration = styleAndLayoutDuration;
    loaf.firstUIEventTimestamp = entry.firstUIEventTimestamp;
    loaf.entryType = entry.entryType;
    loaf.scripts = [];
    loaf.longTasks = [];
    loaf.rawEntry = entry;

    roundNumbers(loaf);
    processScripts(loaf, entry.scripts);
    allOriginalLoAFs.push(entry)
}

//This function processes the scripts and adds them to the relevant groups:
function processScripts(loaf, rawScripts) {
    let isGroupA = false;
    let isGroupB = false;
    let scriptCounter = 1;

    rawScripts.forEach((rawScript) => {
        if (!rawScript.sourceURL) {
            return;
        }
        const script = {};
        const endTime = rawScript.startTime + rawScript.duration;
        const compileDuration = rawScript.executionStart - rawScript.startTime;
        const executionDuration = endTime - rawScript.executionStart;
        // The order here will set the order of the columns in the csv report files:
        script.loafId = loaf.id;
        script.id = ++scriptCounter;
        script.entryType = rawScript.entryType;
        script.startTime = rawScript.startTime;
        script.endTime = endTime;
        script.duration = rawScript.duration;
        script.executionDuration = executionDuration;
        script.name = rawScript.name;
        script.compileDuration = compileDuration;
        script.invokerType = rawScript.invokerType;
        script.invoker = rawScript.invoker;
        script.executionStart = rawScript.executionStart;
        script.forcedStyleAndLayoutDuration = rawScript.forcedStyleAndLayoutDuration;
        script.pauseDuration = rawScript.pauseDuration;
        script.longTaskId = 'No Long Task';
        script.sourceURL = rawScript.sourceURL;
        script.sourceFunctionName = rawScript.sourceFunctionName;
        script.sourceCharPosition = rawScript.sourceCharPosition;
        script.windowAttribution = rawScript.windowAttribution;

        roundNumbers(script);
        loaf.scripts.push(script);
        const groups = filterScriptIntoGroups(script, isGroupA, isGroupB);
        isGroupA = groups.groupA;
        isGroupB = groups.groupB;
    })

    filterLoafIntoGroups(loaf, isGroupA, isGroupB);
}

function filterScriptIntoGroups(script) {
    const groups = {groupA: false, groupB: false};
    if (groupASearchList.length > 0 && isScriptInGroup(groupASearchList, script)) {
        addScriptToGroup(GROUP_A, script);
        groups.groupA = true;
    } else if (groupASearchList.length === 0) {
        addScriptToGroup('all', script);
        groups.groupA = true;
    }
    if (groupBSearchList.length > 0 && isScriptInGroup(groupBSearchList, script)) {
        addScriptToGroup(GROUP_B, script);
        groups.groupB = true;
    }

    return groups
}

function filterLoafIntoGroups(loaf, isGroupA, isGroupB) {
    if (isGroupA === true) {
        addLoafToGroup(GROUP_A, loaf);
        groupALoafsOverview.totalLoafBlockingTime += loaf.blockingDuration || 0;
    }
    if (isGroupB === true) {
        addLoafToGroup(GROUP_B, loaf);
        groupBLoafsOverview.totalLoafBlockingTime += loaf.blockingDuration || 0;
    }
}

//This function adds the loaf to the relevant group and updates the sums of the group:
function addLoafToGroup(loafType, loaf) {
    switch (loafType) {
        case GROUP_A:
        case 'all':
            loaf.group = GROUP_A;
            groupALoafs.push(loaf);
            groupALoafs.sort((a, b) => b.blockingDuration - a.blockingDuration);
            break;
        case GROUP_B:
            loaf.group = loaf.group === GROUP_A ? 'A+B' : GROUP_B;
            groupBLoafs.push(loaf);
            groupBLoafs.sort((a, b) => b.blockingDuration - a.blockingDuration);
            break;
    }
    allProcessedEntries.push(loaf)
}

function setGroup(scriptType) {
    let overviewGroup;
    let summaryGroup;
    let scriptsGroup;
    switch (scriptType) {
        case GROUP_A:
        case 'all':
            overviewGroup = groupALoafsOverview;
            summaryGroup = groupAScriptsSummary;
            scriptsGroup = groupAScripts;
            break;
        case GROUP_B:
            overviewGroup = groupBLoafsOverview;
            summaryGroup = groupBScriptsSummary;
            scriptsGroup = groupBScripts;
            break;
    }
    return {overviewGroup, summaryGroup, scriptsGroup}
}

function processGroupOverview(script, overviewGroup) {
    overviewGroup.totalDuration += script.duration || 0;
    overviewGroup.totalCompileDuration += script.compileDuration || 0;
    overviewGroup.totalExecutionDuration += script.executionDuration || 0;
    if (!overviewGroup.longestScriptId) {
        overviewGroup.longestScriptId = script.id;
    } else {
        if (overviewGroup.longestScriptId.duration < script.duration) {
            overviewGroup.longestScriptId = script.id;
        }
    }
}

function processGroupSummary(script, summaryGroup) {
    const sourceURL = script.sourceURL;
    let scriptInSummary = summaryGroup[sourceURL];
    if (!scriptInSummary) {
        summaryGroup[sourceURL] = {
            source: sourceURL,
            totalDuration: 0,
            totalExecutionDuration: 0,
            totalCompileDuration: 0,
            isInNumberOfLoafs: 0,
            isInNumberOfLongTasks: 0,
            loafsIds: []
        }
    }
    summaryGroup[sourceURL].loafsIds.push(script.loafId);
    summaryGroup[sourceURL].totalDuration += script.duration || 0;
    summaryGroup[sourceURL].totalCompileDuration += script.compileDuration || 0;
    summaryGroup[sourceURL].totalExecutionDuration += script.executionDuration || 0;
    summaryGroup[sourceURL].isInNumberOfLoafs += 1;
}

//This function adds the script to the relevant group and updates the sums of the group:
function addScriptToGroup(scriptType, script) {
    if (!script.sourceURL) {
        return
    }
    const {overviewGroup, summaryGroup, scriptsGroup} = setGroup(scriptType);
    scriptsGroup.push(script);
    processGroupOverview(script, overviewGroup)
    processGroupSummary(script, summaryGroup)
    overviewGroup.numberOfScripts = Object.keys(summaryGroup).length;
}

///////////////////////////////////
///////////UTILS///////////

//This function checks if the script is in the group by matching the search strings with the relevant script fields:
function isScriptInGroup(searchInputList, script) {
    let isInGroup = false
    const fields = ['sourceFunctionName', 'sourceURL'];
    let concatenatedFieldsValues = '';
    for (const field of fields) {
        concatenatedFieldsValues += script[field] ? `${script[field]} ` : '';
    }
    for (const searchInput of searchInputList) {
        if (concatenatedFieldsValues.includes(searchInput)) {
            isInGroup = true
        }
    }
    return isInGroup
}

//This function crosses the long tasks with the loafs and adds the long tasks to the relevant loafs:
function crossLongTasksWithLoafs() {
    const groupsLoafs = [groupALoafs, groupBLoafs];
    longTasks.forEach((longTask, i) => {
        longTask.id = i;
        longTask.scripts = [];
        roundNumbers(longTask);
        groupsLoafs.forEach((loafs) => {
            const group = loafs === groupALoafs ? GROUP_A : GROUP_B;
            const longTasksScripts = group === GROUP_A ? groupALongTasksScripts : groupBLongTasksScripts;
            const groupLongTasks = group === GROUP_A ? groupALongTasks : groupBLongTasks;
            const summaryGroup = group === GROUP_A ? groupAScriptsSummary : groupBScriptsSummary;
            for (let i = 0; i < loafs.length; i++) {
                if (longTask.startTime >= loafs[i].startTime && longTask.startTime <= loafs[i].endTime) {
                    longTask.loafId = loafs[i].id;
                    loafs[i].scripts.forEach((script) => {
                        if (script.startTime >= longTask.startTime && script.startTime <= longTask.endTime) {
                            script.longTaskId = longTask.id;
                            longTasksScripts.push(script);
                            summaryGroup[script.sourceURL].isInNumberOfLongTasks += 1;
                        }
                    })
                    loafs[i].longTasks.push(longTask);
                    groupLongTasks.push(longTask)
                }
            }
        });
    });
}

function initPerformanceObserver(callback, type) {
    const observer = new PerformanceObserver(function (observedLoafEntriesList) {
        observedLoafEntriesList.getEntries().forEach((entry) => callback(entry));
    })
    observer.observe({
        type: type,
        buffered: true
    });
    return observer;
}

function initGroupOverview(group) {
    return {
        group: group,
        numberOfScripts: 0,
        longestScriptId: null,
        totalDuration: 0,
        totalLoafBlockingTime: 0,
        totalCompileDuration: 0,
        totalExecutionDuration: 0,
    }
}

function roundNumbers(object) {
    Object.keys(object).forEach((key) => {
        if (typeof object[key] === "number") {
            object[key] = Math.round(object[key]);
        }
    })
}

function cleanup() {
    const dataObjects = [
        longTasks,
        allProcessedEntries,
        allOriginalLoAFs,
        groupAScripts,
        groupAScriptsSummary,
        groupALoafs,
        groupALongTasksScripts,
        groupALongTasks,
        groupBScripts,
        groupBScriptsSummary,
        groupBLoafs,
        groupBLongTasksScripts,
        groupBLongTasks,
    ];
    for (let object of dataObjects) {
        object = null;
    }
}

///////////////////////////////////
///////////REPORTS HANDLING///////////

function joinSearchStrings(list) {
    return list.join(' ')
}

function printDataToConsole() {
    const consoleHeaderAndMetaData = () => {
        console.log('-------------------- LoAF TOOL -------------------');
        console.log('-------------------- LOAFS META DATA --------------------');
        console.table(loafMetaData);
        console.log('-----------------------------------------');
    }

    const consoleGroupA = () => {
        const groupAData = groupALoafs.length > 0;
        console.log('-------------------- GROUP A --------------------');
        if (!groupAData) {
            console.log('No Loafs Found For Group A');
        } else {
            console.log(' Group A: Overview:');
            console.log('Search Strings:', joinSearchStrings(groupASearchList));
            console.table(groupALoafsOverview);
            console.log('GROUP A: LoAfs:');
            console.table(groupALoafs);
            console.log('GROUP A: Individual Scripts Summery:');
            console.log(groupAScriptsSummary);
            console.log('GROUP A: All Scripts Instances:');
            console.table(groupAScripts);
            console.log('GROUP A: Scripts Involved in Long Tasks');
            console.table(groupALongTasksScripts);
            console.log('GROUP A: Long Tasks');
            console.table(groupALongTasks)
            console.log('-----------------------------------------')
        }
    }

    const consoleGroupB = () => {
        const inputForGroupB = groupBSearchList.length > 0;
        const groupBData = groupBLoafs.length > 0;
        console.log('-------------------- GROUP B --------------------');
        if (!inputForGroupB) {
            console.log('No Search Strings Provided For Group B');
        } else if (!groupBData) {
            console.log('No Loafs Found For Group B');
        } else {
            console.log('GROUP B: Group B Overview:');
            console.log('Search Strings:', joinSearchStrings(groupBSearchList));
            console.table(groupBLoafsOverview);
            console.log('GROUP B: LoAfs:');
            console.table(groupBLoafs);
            console.log('GROUP B: Individual Scripts Summery:');
            console.log(groupBScriptsSummary);
            console.log('GROUP B: All Scripts Instances:');
            console.table(groupBScripts);
            console.log('GROUP B: Scripts Involved in Long Tasks');
            console.table(groupBLongTasksScripts);
            console.log('GROUP B: Long Tasks');
            console.table(groupBLongTasks);
        }
    }

    const consoleLongTasksAndRawData = () => {
        console.log('-----------------------------------------')
        console.log('All Long Tasks:');
        console.table(longTasks);
        console.log('-------------------- ALL RAW LoAF ENTRIES --------------------');
        console.table(allOriginalLoAFs);
        console.log('-----------------------------------------')
        console.log('** To download reports run "downloadReports()" **')
    }

    consoleHeaderAndMetaData();
    consoleGroupA();
    consoleGroupB();
    consoleLongTasksAndRawData();
}

//This function creates and downloads the main CSV report addressing the main data objects groupALoafs and groupBLoafs:
function downloadMainCSVReport() {

    let csvString = '';
    const loafsFromAllGroups = [...groupALoafs, ...groupBLoafs];
    const groupLoaf = groupALoafs[0] ? groupALoafs[0] : groupBLoafs[0];
    const groupScript = groupAScripts[0] ? groupAScripts[0] : groupBScripts[0];

    const SetColumnsLabelsForMainReport = () => {
        Object.keys(groupLoaf).forEach((key) => {
            if (!shouldIgnoreKey(key)) {
                csvString += 'LoAF_' + key + ',';
            }
        });
        Object.keys(groupScript).forEach((key) => {
            csvString += 'SCRIPT_' + key + ',';
        })
    }

    const setTableDataForMainReport = () => {
        const processedLoafsIds = [];
        loafsFromAllGroups.forEach((loaf) => {
            if (!processedLoafsIds.includes(loaf.id)) {
                processedLoafsIds.push(loaf.id);
                Object.keys(loaf).forEach((key) => {
                    if (!shouldIgnoreKey(key)) {
                        csvString += loaf[key] + ',';
                    }
                });
                loaf.scripts.forEach((script, i) => {
                    if (i > 0) {
                        Object.keys(groupLoaf).forEach((key) => {
                            if (!shouldIgnoreKey(key)) {
                                csvString += "" + ',';
                            }
                        });
                    }
                    Object.keys(script).forEach((key) => {
                        csvString += script[key] + ',';
                    });
                    csvString += '\n';
                });
            }
            csvString += '\n';
        });

    }

    SetColumnsLabelsForMainReport();
    csvString += '\n'
    setTableDataForMainReport();

    csvString = "data:application/csv," + encodeURIComponent(csvString);
    const element = document.createElement("A");
    element.setAttribute("href", csvString);
    element.setAttribute("download", `${location.hostname}-${name}-Main-Report-${getDate()}.csv`);
    document.body.appendChild(element);
    element.click();
}

//This function creates and downloads a CSV file from the rest of the  data objects:
function downloadCSVReport(data, name) {
    let csvString = '';

    const SetColumnsLabels = () => {
        const arrayToPrint = [];
        if (!Array.isArray(data)) {
            if (typeof data[Object.keys(data)[0]] === "object") {
                Object.keys(data).forEach((key) => {
                    arrayToPrint.push(data[key]);
                })
                data = arrayToPrint;
                Object.keys(data[Object.keys(data)[0]]).forEach((key) => {
                    if (!shouldIgnoreKey(key)) {
                        csvString += key + ',';
                    }
                });
            } else {
                Object.keys(data).forEach((key) => {
                    csvString += key + ',';
                });
            }
            csvString += '\n'
        } else {
            Object.keys(data[0]).forEach((key) => {
                if (!shouldIgnoreKey(key)) {
                    csvString += key + ',';
                }
            });
            csvString += '\n'
        }
    }

    const setTableData = () => {
        const arrayToPrint = [];
        if (!Array.isArray(data)) {
            if (typeof data[0] === "object") {
                Object.keys(data).forEach((key) => {
                    arrayToPrint.push(data[key])
                })
                data = arrayToPrint;
                data.forEach((o) => {
                    Object.keys(o).forEach((key) => {
                        if (!shouldIgnoreKey(key)) {
                            csvString += o[key] + ',';
                        }
                        if (key === 'loafs') {
                            o[key].forEach((loafId) => {
                                csvString += loafId + '/'
                            })

                        }
                    });
                    csvString += '\n'
                });
            } else {
                Object.keys(data).forEach((key) => {
                    if (!shouldIgnoreKey(key)) {
                        csvString += data[key] + ',';
                    }
                });
            }
        } else {
            data.forEach((o) => {
                Object.keys(o).forEach((key) => {
                    if (!shouldIgnoreKey(key)) {
                        csvString += o[key] + ',';
                    }
                });
                csvString += '\n'
            });
        }
    }

    SetColumnsLabels();
    setTableData();
    csvString = "data:application/csv," + encodeURIComponent(csvString);
    const element = document.createElement("A");
    element.setAttribute("href", csvString);
    element.setAttribute("download", `${location.hostname}-${name}-Report-${getDate()}.csv`);
    document.body.appendChild(element);
    element.click();
}

function downloadOverviews() {
    const data = [groupALoafsOverview, groupBLoafsOverview];
    downloadCSVReport(data, 'LoAFs-Overviews');
}

function downloadScriptsSummaries() {
    const summaries = [groupAScriptsSummary, groupBScriptsSummary];
    const arrayToPrint = [];
    summaries.forEach((summary) => {
        Object.keys(summary).forEach((script) => {
            arrayToPrint.push(summary[script]);
        });
    });
    downloadCSVReport(arrayToPrint, 'A+B-Scripts-Summaries')
}

function downloadAllScriptsReport() {
    const allLoafsScripts = [];
    allProcessedEntries.forEach((loaf) => {
        loaf.scripts.forEach((script) => {
            allLoafsScripts.push(script);
        })
    })
    downloadCSVReport(allLoafsScripts, 'All-LoAFs-Entries-Scripts');
}

function shouldIgnoreKey(key) {
    return keysToIgnoreInReports.includes(key);
}

function getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `${month}/${day}/${year} ${hour}:${minute}:${second}`;
}

///////////////////////////////////
///////////USER INPUT HANDLING///////////

function downloadReports() {
    if (promptDownloadsMessage) {
        shouldDownloadMainReport = confirm('Download main report?');
        shouldDownloadAllOtherReport = confirm('Download all other report?');
    }
    if (shouldDownloadMainReport) {
        downloadMainCSVReport();
    }
    if (shouldDownloadAllOtherReport) {
        downloadOverviews();
        downloadAllScriptsReport();
        downloadScriptsSummaries();
    }
}

///////////////////////////////////
///////////INITIATION///////////

function prepareAndPrintData() {
    if (groupALoafs.length === 0 && groupBLoafs.length === 0) {
        console.log('No Loafs Found')
        return;
    }
    crossLongTasksWithLoafs();
    printDataToConsole();
    downloadReports();
}

function initLoafFinder() {
    observeAndProcessEntries();
    setTimeout(() => {
        prepareAndPrintData();
    }, timeToWaitForData)
}

if (!inTesting) {

    initLoafFinder();
    window.downloadReports = downloadReports;
    window.onbeforeunload = function () {
        return "Data will be lost if you leave the page, are you sure?";
    };
}
console.log('Loaf Finder Running...');


if (inTesting) {
    const loafFinderForTests = {
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
    }
    module.exports = loafFinderForTests;
}
