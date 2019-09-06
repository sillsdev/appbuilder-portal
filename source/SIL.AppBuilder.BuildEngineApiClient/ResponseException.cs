using System;
using System.Text;
using RestSharp;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class ResponseException : Exception
    {
        public string ContentType { get; }
        public long ContentLength { get; }
        public byte[] RawBytes { get; }

        public ResponseException(IRestResponse response)
            : base("Error occred while processing the response", response.ErrorException)
        {
            ContentType = response.ContentType;
            ContentLength = response.ContentLength;
            RawBytes = new byte[response.RawBytes.Length];
            Buffer.BlockCopy(response.RawBytes, 0, RawBytes, 0, response.RawBytes.Length);
        }
    }
}
