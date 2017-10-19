#!/usr/bin/env bash
#!/usr/bin/env bash
# Add colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

DEV=false

# kill and remove any running containers
cleanup () {
    docker-compose -p tosit kill
    docker-compose -p tosit rm -f
    docker volume prune -f

    docker rmi $(docker images -q -f dangling=true)
}

while getopts 'd' flag; do
  case "${flag}" in
    d) DEV=true ;;
    *) ;;
  esac
done

if [ "$DEV" = true ];then
    docker-compose -f docker-compose.dev.yml -p tosit build && docker-compose -f docker-compose.dev.yml -p tosit up
else
    # build and run the composed services
    docker-compose -p tosit build && docker-compose -p tosit up -d
fi

if [ $? -ne 0 ] ; then
    printf "${RED}Docker Compose Failed${NC}\n"
    exit -1
fi

# catch unexpected failures, do cleanup and output an error message
trap 'cleanup ; printf "${RED}Tests Failed For Unexpected Reasons${NC}\n"'\
    HUP INT QUIT PIPE TERM


# wait for the test service to complete and grab the exit code
TEST_EXIT_CODE=`docker wait tosit_authentication-service-it_1`

# output the logs for the test (for clarity)
docker logs tosit_authentication-service-it_1

# inspect the output of the test and display respective message
if [ -z ${TEST_EXIT_CODE+x} ] || [ "$TEST_EXIT_CODE" -ne 0 ] ; then
    printf "${RED}Tests Failed${NC} - Exit Code: $TEST_EXIT_CODE\n"
else
    printf "${GREEN}Tests Passed${NC}\n"
fi

# call the cleanup function
cleanup

# exit the script with the same code as the test service code
exit ${TEST_EXIT_CODE}

