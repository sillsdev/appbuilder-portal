{
    openworkflowdesigner: function (args) {
        var url = "/admin?apanel=workflowinstances&aid=" + args.data.Id;
        return {
            router: {
                redirect: url
            }
        };
    }
}