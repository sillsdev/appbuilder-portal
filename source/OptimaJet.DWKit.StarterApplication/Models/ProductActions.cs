﻿using System;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductActions : Identifiable<Guid>
    {
        [Attr("types")]
        public IEnumerable<string> Types { get; set; }
    }
}
