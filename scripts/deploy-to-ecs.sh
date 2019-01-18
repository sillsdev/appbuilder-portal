set -a

./build-setup.sh $1 $2

if [ -n "$ECS_CLUSTER" ]; then
  ecs-deploy -c $ECS_CLUSTER -n portal -i ignore -to $CURRENT_VERSION --max-definitions 20 --timeout 300
fi