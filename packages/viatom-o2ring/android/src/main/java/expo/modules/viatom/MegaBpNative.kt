package expo.modules.viatom

class MegaBpNative {
    external fun initNative()
    external fun stepNative(ppgVal: Int): DoubleArray
    external fun terminateNative()

    companion object {
        init {
            System.loadLibrary("megabp")
        }
    }
}