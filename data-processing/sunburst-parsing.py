import argparse
def main():
    args = parse_args()
    csvData = parseFile(args.input, ',')
    createUMIData(csvData,args.output)

def parse_args():
    """
        Argument parser
    """
    parser = argparse.ArgumentParser( formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("-i", "--input", type=str, required=True,
                        help="input file-name")
    parser.add_argument("-o", "--output", type=str, required=True,
                        help="input file-name")

    # parse all arguments
    args = parser.parse_args()

    return args

def parseFile(inputFile, delimiter):
    """
    The function parseFile opens an input file and parses it based on delimiter
    :param inputFile: A String containing the name of the input file.
    :param delimiter: A String containing the delimiter the file will be split on.
    :return: data: An Array containing the parsed data of given the file.
    """
    f = open(inputFile)

    data = []
    for line in f:
         data_line = line.rstrip().split(delimiter)
         data.append(data_line)

    return data

def createUMIData(csvData,outputFile):
    """
    The function createUMIData takes the parsed primer data and writes in to an csv file in the correct format.
    :param csvData: An Array containing the parsed data of given the file.
    :return: -
    """
    outF = open(outputFile, "w")
    for i in range(len(csvData)):
        # write line to output file
        if i > 0:
            outF.write(csvData[i][5] + "|" + csvData[i][6] + "," + csvData[i][4])
            outF.write("\n")
    outF.close()


main()