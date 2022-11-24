#!/usr/bin/env bash

SERVER_ROOT=http://localhost:3085

RUNTIME=$(date +%s)

RED='\033[0;31m'
GREEN='\033[1;92m'
CYAN='\033[1;96m'
PURPLE='\033[1;95m'
NC='\033[0m'

while getopts b:t:s:e:f: flag
do
    case "${flag}" in
        b) BUILDING=${OPTARG};;
        t) FILTER_TYPE=${OPTARG};;
        s) START=${OPTARG};;
        e) END=${OPTARG};;
        f) FPS=${OPTARG};;
    esac
done

if [ -z ${BUILDING+x} ]; then
    echo -n "Building: "
    read BUILDING
else
    echo "Building: $BUILDING";
fi

if [ -z ${FILTER_TYPE+x} ]; then
    echo -n "Filter Type: "
    read FILTER_TYPE
else
    echo "Filter Type: $FILTER_TYPE";
fi

if [ -z ${START+x} ]; then
    echo -n "Start Time: "
    read START
else
    echo "Start Time: $START";
fi

if [ -z ${END+x} ]; then
    echo -n "End Time: "
    read END
else
    echo "End Time: $END";
fi

if [ -z ${FPS+x} ]; then
    echo -n "FPS: "
    read FPS
else
    echo "FPS: $FPS";
fi

IMAGE_PATH="$SERVER_ROOT/skyline/filter?building=$BUILDING&type=$FILTER_TYPE"

printf "\nInitializing variables...\\n"

printf "Creating temporary directory on local machine...\\n"

mkdir -p ./.auto-timelapse-temp/
mkdir ./.auto-timelapse-temp/$RUNTIME/

printf "Determining size of images...\\n"

IMAGE_DIMENSIONS=$(curl -r 0-25 --silent "$IMAGE_PATH&datetime=$START" | identify -format "%wx%h" -)
IMAGE_DIMENSIONS_PARTS=(${IMAGE_DIMENSIONS//x/ })

round() {
    echo $((${1:?empty}/2*2))
}

WIDTH=$(round $((IMAGE_DIMENSIONS_PARTS[0])))
HEIGHT=$(round $((IMAGE_DIMENSIONS_PARTS[1])))

printf "Downloading images...\\n\n"

# Based on: https://stackoverflow.com/questions/4434782/loop-from-start-date-to-end-date-in-mac-os-x-shell-script
sDateTs=`date -j -f "%Y-%m-%d-%H-%M" $START "+%s"`
eDateTs=`date -j -f "%Y-%m-%d-%H-%M" $END "+%s"`
dateTs=$sDateTs
offset=60
i=0

while [ "$dateTs" -le "$eDateTs" ]
do
    date=`date -j -f "%s" $dateTs "+%Y-%m-%d-%H-%M"`
    curl "$IMAGE_PATH&datetime=$date" --output ./.auto-timelapse-temp/$RUNTIME/$date.jpg --silent
    printf ">> $date\\n"
    dateTs=$(($dateTs+$offset))
    ((i=i+1))
done

printf "\n"

printf "${CYAN}Starting timelapse creation...${NC}\\n\n"

ffmpeg -loglevel error -stats -r $FPS -pattern_type glob -i "./.auto-timelapse-temp/$RUNTIME/*.jpg" -s "$((WIDTH))x$((HEIGHT))" -vcodec libx264 ./$START-to-$END-at-$FPS-fps.mp4

printf "\n${GREEN}# # # # FINISHED TIMELAPSE CREATION # # # #${NC}\\n\n"

echo "Cleaning up..."

rm -r ./.auto-timelapse-temp/

printf "\n${GREEN}# # # # DONE # # # #${NC}\\n\n"
printf "Output: ${PURPLE}$START-to-$END-at-$FPS-fps.mp4${NC}\\n\n"

open ./$START-to-$END-at-$FPS-fps.mp4
