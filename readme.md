## Sunburst visualization that visualizes RC-PCR primer distribution.

# How to create the visualization
    - Pull the main branch from Github
    - Make sure node and npm are installed
    - Run "npm install" to install needed packages
    - Add the CSV file you want to use for the visualization in the main directory and call it Data.csv
        - Change the filename of 'loadedData' variable in de src/index.js if you want your data file to have a different name
    - run npm run build in the main directory
    - Open the index.html file and use the visualization

# How to distribute the visualization(the files that are needed to keep the visualization work)
    - The dist folder, this folder should include the bundle.js file
    - The index.html file
    - The style.css file
        - Note: Make sure the file structure stays the same

# Development
    - For development, you can follow the following steps:
        - Pull the main branch from Github
        - Make sure node and npm are installed
        - Run "npm install" to install needed packages
        - Add the CSV you want to use for the visualization in the main directory and call it Data.csv
            - Change the filename of 'loadedData' variable in de src/index.js if you want your data file to have a different name
        - Run npm run dev in the main directory
        - Open the project with the given URL
            -   Note: The project will now update automatically when making changes to your files.
