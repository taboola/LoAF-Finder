# LoAF - Finder
## Description
This script helps you analyze Long Animation Frame (LoAF) entries to identify performance bottlenecks in your web application.
It filters "long-animation-frame" Performance entries based on keywords that you provide, and finds the correlated "long-task" entries.
The data is also categorized into groups for comparison and is available for download as a CSV file.

#### Google's Long Animation Frame (LoAF) API
This project is based on Google's LoAF API, for further information please read:
https://developer.chrome.com/docs/web-platform/long-animation-frames

## Features:
- Filters LoAF entries based on script names, URLs, or function names.
- Groups entries into two groups (A & B) for easy comparison.
- Provides detailed summaries of relevant LoAF entries, including blocking duration, execution time, and script details.
- Generates downloadable CSV reports for further analysis.

## Types of CSV reports
- Main report - contains ellaborate LoAF data from all of the groups
- LoAFs-Overviews - contains general overview of LoAFs of both comparison groups.
  Column | Description 
  --- | --- 
  group | A or B
  numberOfScripts | The number of the scripts in each group
  longestScriptId | The index of the longest script in the group. you can later find this script in the min report 
  totalDuration | The total duration of the scripts in the group
  totalLoafBlockingTime | The total blocking time of LoAFs in each group
  totalCompileDuration | The total compile duration of the scripts in the group
  totalExecutionDuration | The total execution of the scripts in the group 
- A+B-Scripts-Summaries - contains summary of the scripts in each group.
  Column | Description 
  --- | --- 
  source |  Script URL
  totalDuration | The total script duration
  totalExecutionDuration | The total execution duration of the script
  totalCompileDuration | The total compile duration of the script
  isInNumberOfLoafs | The number of LoAFs the script is part of
  isInNumberOfLongTasks | The number of long tasks the script is part of
  loafsIds | A list of the loafs the script is part of
- All-LoAFs-Entries-Scripts - contains all of the scripts with the data supplied by the API
  

## Instructions:
Follow these steps to find relevant "long-animation-frame" Performance entries that contain scripts that match the supplied keywords.

### Edit the settings:
1. Set `promptDownloadsMessage` to `false` to disable controlling the downloads using prompts.
2. Enter keywords to the `groupASearchList` and `groupBSearchList` arrays.
   * **Important Note - Leaving groupA empty will include all entries into group A without filtering.**
   * **You can still use groupBSearchList to filter entries into group B.**
3. Set `shouldDownloadMainReport` to true to download the main report.
4. Set `shouldDownloadAllOtherReports` to true to download all other reports.
5. Adjust the `keysToIgnoreInReports` array to exclude specific fields from reports.
6. Set `inTesting` to true when running project's unit tests.

### Run the script:
1. Copy the contents of 'src/loaf-finder.js'
2. Open in Chrome the page that you want to check
3. Execute the code

It is recommended to execute the code either by pasting it to the devTools console or as a snippet.   
More information or devTools snippets can be found here: https://developer.chrome.com/docs/devtools/javascript/snippets

### View the results:
The script will print the results in the devTools console.
Example:
![image](https://github.com/BarakKalfa/LoAF-finder/assets/142159033/8b132d3e-b377-4c80-904f-819640bb7bec)

### Download reports: (Optional)
You'll be prompted to download reports containing detailed data for each group.
* You can choose to disable this prompt by setting `promptDownloadsMessage` to `false`.
* You can also control what reports to download by setting the `shouldDownloadMainReport` and `shouldDownloadAllOtherReports` settings.
* you can also download the reports later by running the `downloadReports` function in the console.

### Example Usage:
1. Update `groupASearchList` and `groupBSearchList` arrays with keywords.
2. Run the script in your browser's developer tools console or as a snippet.
3. Choose whether to download reports or not.
4. Open devTools console to view the results.

#### Browser Compatibility
Chrome >= 123

# 🤝 Contributing to `LoAF - Finder`
Any kind of positive contribution is welcome! Please help us to grow by contributing to the project.

If you wish to contribute, you can work on any features of your own. After adding your code, please send us a Pull Request.
Please read [`CONTRIBUTING`](CONTRIBUTING.md) for details on our [`CODE OF CONDUCT`](CODE_OF_CONDUCT.md), and the process for submitting pull requests to us.
