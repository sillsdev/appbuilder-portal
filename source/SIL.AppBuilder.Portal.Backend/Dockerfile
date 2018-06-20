# sdk/latest as of 2018-06-20

###############################
# Dependencies
FROM microsoft/dotnet:2.1.301-sdk as dependencies
WORKDIR /app

COPY OptimaJet.DWKit.Application/*.csproj /app/OptimaJet.DWKit.Application/
COPY SIL.AppBuilder.Portal.Backend/*.csproj /app/SIL.AppBuilder.Portal.Backend/
WORKDIR /app/SIL.AppBuilder.Portal.Backend/
RUN dotnet restore

###############################
# Development
FROM dependencies as development
COPY . /app
COPY --from=dependencies /app /app
WORKDIR /app/SIL.AppBuilder.Portal.Backend



###############################
# Tests
FROM dependencies as testrunner
WORKDIR /app/SIL.AppBuilder.Portal.Backend.Tests/
COPY SIL.AppBuilder.Portal.Backend.Tests/. .
ENTRYPOINT ["dotnet", "test", "--logger:trx"]

###############################
# Release
FROM dependencies as build-release
WORKDIR /app/
COPY SIL.AppBuilder.Portal.Backend/. /app/SIL.AppBuilder.Portal.Backend/
COPY OptimaJet.DWKit.Application/. /app/OptimaJet.DWKit.Application/
COPY --from=dependencies /app /app
WORKDIR /app/SIL.AppBuilder.Portal.Backend
RUN dotnet publish -c Release -o out

FROM microsoft/dotnet:2.1.301-runtime AS runtime-release
WORKDIR /app
COPY --from=build-release /app/SIL.AppBuilder.Portal.Backend/out ./
ENTRYPOINT ["dotnet", "dotnetapp.dll"]
