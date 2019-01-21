set -a

source ./scripts/build-setup.sh

echo "Attempting to deploy $CURRENT_VERSION to Cluster: '$ECS_CLUSTER'..."

if [ -n "$ECS_CLUSTER" ]; then
  ecs-deploy -c $ECS_CLUSTER -n portal -i ignore -to $CURRENT_VERSION --max-definitions 20 --timeout 300
fi
