import glob
import os
import csv
import argparse

def main():
    args = parse_args()
    parsedFiles = parseBatchFiles(args.input)
    exportBatchFiles(parsedFiles,args.output)

def parse_args():
    """
        Argument parser
    """
    parser = argparse.ArgumentParser(formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("-i", "--input", type=str, required=True,
                        help="input folder-name")
    parser.add_argument("-o", "--output", type=str, required=True,
                        help="input file-name")

    # parse all arguments
    args = parser.parse_args()

    return args

def parseBatchFiles(path):
    """
    The function parseBatchFiles opens all *.res files of a given directory, opens them and adds them to an Array in the
    correct format.
    :param path: A String containing the path to the folder containing the files that will be used.
    :return: parsedFiles: An Array containing all the parsed data from the files location in the input folder.
    """
    parsedFiles = []
    for filename in glob.glob(os.path.join(path, '*.res')):
        filePath = filename.split("/")
        parsedFiles.append(filePath[len(filePath) - 1])
        with open(os.path.join(os.getcwd(), filename), 'r') as f:  # open in readonly mode
            for line in csv.reader(f, dialect="excel-tab"):
                if (line[0] == "#Template"):
                    parsedFiles.append(",".join(line))
                else:
                    newLine = line[0].split(' ')
                    line[0] = " ".join(newLine[1:])
                    line[0] = line[0].replace(" ", "_")
                    parsedFiles.append(",".join(line).replace(" ", ""))
    return parsedFiles


def exportBatchFiles(parsedFiles, outputFile):
    """
    The function exportBatchFiles creates an output file for all the processed files.
    :param parsedFiles: An Array containing all the parsed data from the files location in the input folder.
    :param outputFile: A String containing the name that will be given to the output file.
    :return:
    """
    outF = open(outputFile, "w")
    for line in parsedFiles:
        outF.write(line + "\n")
    outF.close()

main()


