# LoAF - Finder
## Description
This script helps you analyze Long Animation Frame (LoAF) entries to identify performance bottlenecks in your web application.
It filters and cross entries returning from both "long-animation-frame" and "longtask" PerformanceObserver using keywords you provide. The data is also categorizes into groups for comparison.

#### Google's Long Animation Frame (LoAF) API: https://developer.chrome.com/docs/web-platform/long-animation-frames

## Features:
- Filters LoAF entries based on script names, URLs, or function names.
- Groups entries into two groups (A & B) for easy comparison.
- Provides detailed summaries of relevant LoAF entries, including blocking duration, execution time, and script details.
- Generates downloadable CSV reports for further analysis.

## Instructions:

### Edit the settings:
1. Update the `usePrompts` variable to `false` to disable prompts and use pre-defined settings.
2. Modify the `groupASearchList` and `groupBSearchList` arrays to specify keywords for each group.
   * **Important Note - Leaving groupA empty will include all entries into group A without filtering.**
3. Adjust the `keysToIgnoreInReports` array to exclude specific fields from reports.

### Run the script:
Run the script in your devTools console or as a snippet in the source tab.
If `usePrompts` is true, you'll be prompted to enter keywords for each group.

### View the results:
The script will console all data processed and filtered in the devTools console.

### Download reports: (Optional)
You'll be prompted to download reports containing detailed data for each group.

### Example Usage (with prompts):
1. Run the script in the devTools console or as a snippet.
2. Enter keywords for Group A separated by spaces (e.g., "scriptA.js functionA my.domainA.com").
3. Enter keywords for Group B (e.g., "scriptB.js functionB my.domainB.com").
4. Choose if to download reports (you can also download them later).
5. Open devTools console to view the results.

### Example Usage (without prompts):
1. Set `usePrompts` to false in the settings.
2. Update `groupASearchList` and `groupBSearchList` arrays with keywords.
3. Run the script in your browser's developer tools console or as a snippet.
4. Choose if to download reports (you can also download them later).
5. Open devTools console to view the results.

#### Note:
This script relies on the browser's PerformanceObserver API for long-animation-frame and will not work in all environments.

# 🤝 Contributing to `LoAF - Finder`
Any kind of positive contribution is welcome! Please help us to grow by contributing to the project.

If you wish to contribute, you can work on any features of your own. After adding your code, please send us a Pull Request.

> Please read [`CONTRIBUTING`](CONTRIBUTING.md) for details on our [`CODE OF CONDUCT`](CODE_OF_CONDUCT.md), and the process for submitting pull requests to us.
