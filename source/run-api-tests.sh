#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

dotnet test ${DIR}/SIL.AppBuilder.Portal.Backend.Tests/SIL.AppBuilder.Portal.Backend.Tests.csproj
