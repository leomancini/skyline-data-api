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

printf "Calculating dimension of images...\\n"

IMAGE_DIMENSIONS=$(curl -r 0-25 --silent "$IMAGE_PATH&datetime=$START" | identify -format "%wx%h" -)
IMAGE_DIMENSIONS_PARTS=(${IMAGE_DIMENSIONS//x/ })

round() {
    echo $((${1:?empty}/2*2))
}

WIDTH=$(round $((IMAGE_DIMENSIONS_PARTS[0])))
HEIGHT=$(round $((IMAGE_DIMENSIONS_PARTS[1])))

# Based on: https://stackoverflow.com/questions/4434782/loop-from-start-date-to-end-date-in-mac-os-x-shell-script
sDateTs=`date -j -f "%Y-%m-%d-%H-%M" $START "+%s"`
eDateTs=`date -j -f "%Y-%m-%d-%H-%M" $END "+%s"`
dateTs=$sDateTs
dateTsTotalCalc=$sDateTs
offset=60
total=0
i=0

printf "Calculating total number of images...\\n"

while [ "$dateTsTotalCalc" -le "$eDateTs" ]
do
    dateTsTotalCalc=$(($dateTsTotalCalc+$offset))
    ((total=total+1))
done

# Based on: https://github.com/fearside/ProgressBar/
function renderProgressBar {
    let _progress=(${1}*100/${2}*100)/100
    let _done=(${_progress}*4)/10
    let _left=40-$_done
    _fill=$(printf "%${_done}s")
    _empty=$(printf "%${_left}s")

    printf "\rDownloading ${3}... Progress: [${_fill// /#}${_empty// /-}] ${_progress}%%"
}

printf "Downloading images..."

while [ "$dateTs" -le "$eDateTs" ]
do
    date=`date -j -f "%s" $dateTs "+%Y-%m-%d-%H-%M"`
    curl "$IMAGE_PATH&datetime=$date" --output ./.auto-timelapse-temp/$RUNTIME/$date.jpg --silent
    renderProgressBar ${i} ${total} ${date}
    dateTs=$(($dateTs+$offset))
    ((i=i+1))
done

printf "\rDownloaded ${total} images...\033[K\n"

printf "${CYAN}Starting timelapse creation...${NC}\\n\n"

VIDEOS_FOLDER=videos
mkdir -p ./$VIDEOS_FOLDER/

VIDEO_FILE=$VIDEOS_FOLDER/$BUILDING-filter-type-$FILTER_TYPE-$START-to-$END-at-$FPS-fps.mp4

ffmpeg -loglevel error -stats -r $FPS -pattern_type glob -i "./.auto-timelapse-temp/$RUNTIME/*.jpg" -s "$((WIDTH))x$((HEIGHT))" -vcodec libx264 ./$VIDEO_FILE

printf "\n${GREEN}# # # # FINISHED TIMELAPSE CREATION # # # #${NC}\\n\n"

echo "Cleaning up..."

rm -r ./.auto-timelapse-temp/

printf "\n${GREEN}# # # # DONE # # # #${NC}\\n\n"
printf "Output: ${PURPLE}$VIDEO_FILE${NC}\\n\n"

open ./$VIDEO_FILE
