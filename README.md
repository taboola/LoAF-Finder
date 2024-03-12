# LoAF - Finder
## Description
This script helps you analyze Long Animation Frame (LoAF) data to identify performance bottlenecks in your web application.
It filters and cross data returning from both "long-animation-frame" and "longtask" PerformanceObserver based on keywords you provide. 
The data is also categorizes into groups for comparison and is available for download as a CSV file.

#### Google's Long Animation Frame (LoAF) API: 
- https://developer.chrome.com/docs/web-platform/long-animation-frames 
- https://github.com/w3c/long-animation-frames 

## Features:
- Filters LoAF data based on script names, URLs, or function names.
- Groups data into two groups (A & B) for easy comparison.
- Provides detailed summaries of relevant LoAF data, including blocking duration, execution time, and script details.
- Generates downloadable CSV reports for further analysis.

## Instructions:
This script helps you finds relevant long animation frame data by looking for keywords you specify in the scripts data returning from the loAF API.

### Edit the settings:
1. promptDownloadsMessage:
- Type: boolean
- Controls whether the system prompts the user with messages about downloads.
- Setting to false disables these prompts.
  
2. groupASearchList and groupBSearchList:
- Type: arrays of strings (keywords)
- Used for filtering data into different groups.
- If groupASearchList is empty, all data is included in Group A without filtering.
- groupBSearchList can still be used to filter data into Group B, even with an empty groupASearchList.
  
3. shouldDownloadMainReport:
- Type: boolean
- Determines whether the main report is downloaded.
- Set to true to enable downloading.
  
4. shouldDownloadAllOtherReports:
- Type: boolean
- Controls whether all reports other than the main report are downloaded.
- Set to true to download them.
  
5. keysToIgnoreInReports:
- Type: array of strings (field names)
- Specifies fields to exclude from generated reports.

6. inTesting:
- Type: boolean
- Indicates whether unit tests are being run.
- Set to true for test environments.

Key Points:
- Adjust settings based on your specific requirements for downloads, filtering, and report generation.
- Empty groupASearchList includes all data in Group A, allowing separate filtering for Group B.
- Use keysToIgnoreInReports to customize report content.

### Run the script:
Run the script in your devTools console or as a snippet in the source tab.

### View the results:
The script will console the results in the devTools console.

### Download reports: (Optional)
You'll be prompted to download reports containing detailed data for each group.
* You can choose to disable this prompt by setting `promptDownloadsMessage` to `false`.
* You can also control what reports to downloads by setting the `shouldDownloadMainReport` and `shouldDownloadAllOtherReports` settings.
* you can also download the reports later by running the `downloadReports` function in the console.
* 

### Example Usage:
1. Update `groupASearchList` and `groupBSearchList` arrays with keywords.
2. Run the script in your browser's developer tools console or as a snippet.
3. Choose if to download reports.
4. Open devTools console to view the results.

#### Note:
This script relies on the browser's PerformanceObserver API for long-animation-frame and will not work in all environments.

# 🤝 Contributing to `LoAF - Finder`
Any kind of positive contribution is welcome! Please help us to grow by contributing to the project.

If you wish to contribute, you can work on any features of your own. After adding your code, please send us a Pull Request.

> Please read [`CONTRIBUTING`](CONTRIBUTING.md) for details on our [`CODE OF CONDUCT`](CODE_OF_CONDUCT.md), and the process for submitting pull requests to us.
