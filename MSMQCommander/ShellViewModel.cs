using Caliburn.Micro;

namespace MSMQCommander {
    using System.ComponentModel.Composition;

    [Export(typeof(IShell))]
    public class ShellViewModel : PropertyChangedBase, IShell {}
}
