#!/bin/bash

echo Prepring the deployment package
rm ./dist/lambda.zip
zip -j -r ./dist/lambda.zip ./dist

echo Open your AWS console, navigate to the lambda function and upload the zip
echo

